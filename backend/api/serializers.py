from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, ChatSession, Message

class UserSerializer (serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'created_at', 'author']
        read_only_fields = ['author']

class MessageSerializer(serializers.ModelSerializer):
    # Optionally include nested information if needed
    parent_message_id = serializers.PrimaryKeyRelatedField(
        source='parent_message', queryset=Message.objects.all(), allow_null=True, required=False
    )

    class Meta:
        model = Message
        fields = [
            'id', 'session', 'role', 'content', 'created_at',
            'parent_message_id', 'metadata'
        ]
        read_only_fields = ['id', 'created_at']

class ChatSessionSerializer(serializers.ModelSerializer):
    # Nested messages (read-only) so that when retrieving a session, you can see its messages.
    messages = MessageSerializer(many=True, read_only=True)
    user_username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = ChatSession
        fields = [
            'id', 'user', 'user_username', 'created_at', 'updated_at',
            'context', 'messages'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'messages', 'user_username']

