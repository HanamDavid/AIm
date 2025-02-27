import os
import requests
from .models import ChatSession, Message

class MistralService:
    def __init__(self):
        self.api_key = os.getenv("MISTRAL_API_KEY")
        self.base_url = "https://api.mistral.ai/v1/chat/completions"

    def generate_response(self, session, user_message):
        """
        Generates a response from Mistral API and saves it in the database.

        Args:
            session (ChatSession): The chat session object.
            user_message (str): The user input message.

        Returns:
            dict: Mistral API response
        """
        # Save user message in the database
        user_msg = Message.objects.create(
            session=session, role="user", content=user_message
        )

        # Get conversation history
        messages = [
            {"role": msg.role, "content": msg.content}
            for msg in session.messages.all()
        ]

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "mistral-medium",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1000
        }

        try:
            response = requests.post(self.base_url, headers=headers, json=data, timeout=30)
            response.raise_for_status()
            api_response = response.json()

            # Extract AI response text
            ai_text = api_response.get("choices", [{}])[0].get("message", {}).get("content", "")

            # Save AI response in the database
            Message.objects.create(
                session=session, role="assistant", content=ai_text
            )

            return {"response": ai_text}

        except requests.exceptions.RequestException as e:
            return {"error": str(e)}

