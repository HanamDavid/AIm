from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
import json
import os
import requests
from .models import Note, ChatSession, Message
from .serializers import UserSerializer, NoteSerializer
from django.shortcuts import render
from django.contrib.auth.models import User

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)

class CreateUserView (generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat_with_mistral(request):
    print("trying something")
    """
    Handles user messages, manages chat sessions, and communicates with Mistral AI.
    """
    print(request)
    try:
        # Cargar los datos de la solicitud
        data = json.loads(request.body)
        user = request.user
        user_message = data.get("message", "").strip()
        print("Raw Request Body:", request.body)

        # Validar que el mensaje no esté vacío
        if not user_message:
            return JsonResponse({"error": "Message is required"}, status=400)

        # Obtener o crear una sesión de chat para el usuario
        session, _ = ChatSession.objects.get_or_create(user=user)

        # Guardar el mensaje del usuario en la base de datos
        Message.objects.create(session=session, role="user", content=user_message)

        # Obtener mensajes previos para el contexto
        messages = [
            {"role": msg.role, "content": msg.content}
            for msg in session.messages.all()
        ]

        # Preparar la solicitud a la API de Mistral
        headers = {
            "Authorization": f"Bearer {os.getenv('MISTRAL_API_KEY')}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "mistral-medium",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1000
        }

        print(headers)
        print(payload)
        # Hacer la petición a la API de Mistral
        response = requests.post("https://api.mistral.ai/v1/chat/completions", headers=headers, json=payload)
        response_data = response.json()
        print(response_data)

        print("Respuesta de Mistral:", response_data)  # Debugging

        # Extraer la respuesta del asistente con manejo de errores
        try:
            ai_response = response_data["choices"][0]["message"]["content"]
        except (KeyError, IndexError):
            ai_response = "Error: No se pudo obtener una respuesta válida de Mistral."

        # Guardar la respuesta en la base de datos
        Message.objects.create(session=session, role="assistant", content=ai_response)

        return JsonResponse({"response": ai_response})

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)

    except requests.RequestException as e:
        return JsonResponse({"error": f"Error en la solicitud a Mistral: {str(e)}"}, status=500)

    except Exception as e:
        return JsonResponse({"error": f"Error interno del servidor: {str(e)}"}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chat_history(request):
    user = request.user
    session_id = request.GET.get("session_id")
    if session_id:
        session = ChatSession.objects.filter(user=user, id=session_id).first()
    else:
        session = ChatSession.objects.filter(user=user).first()

    if not session:
        return JsonResponse({"messages": []})  # No history

    messages = [
        {"id": msg.id, "role": msg.role, "content": msg.content, "created_at": msg.created_at.isoformat()}
        for msg in session.messages.all().order_by("created_at")
    ]
    return JsonResponse({"messages": messages})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_sessions(request):
    user = request.user
    sessions = ChatSession.objects.filter(user=user).order_by("-created_at")
    sessions_list = [
        {"id": s.id, "created_at": s.created_at.isoformat(), "last_updated": s.updated_at.isoformat()}
        for s in sessions
    ]
    return JsonResponse({"sessions": sessions_list})

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_session(request, session_id):
    """
    Deletes a ChatSession for the authenticated user.
    """
    user = request.user
    try:
        session = ChatSession.objects.get(id=session_id, user=user)
        session.delete()
        return JsonResponse({"message": "Session deleted successfully."}, status=200)
    except ChatSession.DoesNotExist:
        return JsonResponse({"error": "Session not found."}, status=404)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_session(request):
    """
    Creates a new ChatSession for the authenticated user.
    The session context is preloaded with a system prompt that instructs the AI
    to act as an expert in both general economics and engineering economy (ingeco),
    using methodologies from "Ingeniería Económica" by Blank and Tarquin (6th Edition),
    and to incorporate Colombian economic insights.
    Immediately after creation, the bot posts an initial message indicating its expertise
    and readiness to guide the user.
    """
    user = request.user

    prompt_context = {
        "system_prompt": (
            "You are an expert in both general economics and engineering economy (ingeco), "
            "using methodologies from the book 'Ingeniería Económica' by Blank and Tarquin (6th Edition). "
            "In addition, you are highly knowledgeable about Colombian economic conditions, including growth trends, "
            "structural reforms, and public policy. Always start the conversation by guiding the user and asking how "
            "you can assist with their economic analysis or project evaluation. Provide precise, technical, and "
            "data-driven responses, and be ready to answer questions related to engineering economy (INGECO) based on "
            "the approaches described in the book."
        )
    }

    # Create the chat session with the prompt context
    session = ChatSession.objects.create(user=user, context=prompt_context)

    # Create an initial assistant message that reflects the system prompt and sets the tone for the session.
    initial_bot_message = (
        "Hello! I'm your expert assistant in economics and engineering economy. "
        "I have a deep understanding of Colombian economic trends, structural reforms, and public policy. "
        "How can I assist you today?"
    )
    Message.objects.create(session=session, role="assistant", content=initial_bot_message)

    data = {
        "session": {
            "id": str(session.id),
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat(),
            "context": session.context,
            "initial_message": initial_bot_message
        }
    }
    return JsonResponse(data, status=201)


