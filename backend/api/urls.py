from django.urls import path
from . import views
from .views import create_session,delete_session, chat_with_mistral, get_chat_history, get_sessions, NoteListCreate, NoteDelete, CreateUserView

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>", views.NoteDelete.as_view(), name="delete-note"),
    path("chat_with_mistral/", chat_with_mistral, name="chat_with_mistral"),
    path("get_chat_history/", get_chat_history, name="get_chat_history"),
    path("get_sessions/", get_sessions, name="get_sessions"),
    path("create_session/", create_session, name="create_session"),
    path("delete_session/<uuid:session_id>/", delete_session, name="delete_session"),
]
