import { useState, useRef, useEffect } from "react";
import "../styles/ChatStyles.css";
import MessageInput from "../components/MessageInput";
import ChatMessage from "../components/ChatMessage";
import { askMistral } from "../api";
import api from "../api";

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch available sessions when component mounts
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get("/api/get_sessions/", {
          withCredentials: true,
        });
        const sessionData = response.data.sessions;
        setSessions(sessionData);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, []);

  // Fetch chat history when a session is selected
  useEffect(() => {
    if (!selectedSession) return;
    const fetchChatHistory = async () => {
      try {
        const response = await api.get("/api/get_chat_history/", {
          params: { session_id: selectedSession },
          withCredentials: true,
        });
        if (response.data.messages) {
          const loadedMessages = response.data.messages.map((msg) => ({
            id: msg.id,
            text: msg.content,
            sender: msg.role === "assistant" ? "bot" : "user",
            timestamp: new Date(msg.created_at),
          }));
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChatHistory();
  }, [selectedSession]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    try {
      const result = await askMistral(text,selectedSession);
      const botMessage = {
        id: messages.length + 2,
        text: result,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble responding right now. Please try again later.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Cuando el usuario selecciona una sesión existente
  const handleSessionSelect = (sessionId) => {
    setSelectedSession(sessionId);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.delete(`/api/delete_session/${sessionId}/`, {
        withCredentials: true,
      });
      // After deletion, refresh sessions list and clear current session
      const sessionsResponse = await api.get("/api/get_sessions/", {
        withCredentials: true,
      });
      setSessions(sessionsResponse.data.sessions);
      setSelectedSession(null);
      setMessages([]);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  // Botón para volver al selector de sesiones
  const handleBackToSessions = () => {
    setSelectedSession(null);
    setMessages([]);
  };

  // Crear una nueva sesión llamando al endpoint de creación
  const handleNewSession = async () => {
    try {
      const response = await api.post(
        "/api/create_session/",
        {},
        { withCredentials: true },
      );
      const newSession = response.data.session;
      // Actualiza la lista de sesiones y selecciona la nueva
      setSessions((prev) => [newSession, ...prev]);
      setSelectedSession(newSession.id);
      setMessages([]);
    } catch (error) {
      console.error("Error creating new session:", error);
    }
  };

  // Si no hay sesión seleccionada, mostramos el selector de sesiones
  if (!selectedSession) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h2>Select a Chat Session</h2>
          <p>Please choose an existing session or create a new one.</p>
        </div>
        <div className="sessions-container">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session.id}
                className="session-item"
                style={{
                  cursor: "pointer",
                  padding: "8px",
                  borderBottom: "1px solid #ccc",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="session-container"onClick={() => handleSessionSelect(session.id)}>
                  Session {session.id.slice(0, 3)} -{" "}
                  {new Date(session.created_at).toLocaleString()}
                </span>
                <button className="delete-session"onClick={() => handleDeleteSession(session.id)}>
                  x
                </button>
              </div>
            ))
          ) : (
            <p> Look's like there are no sessions</p>
          )}
        </div>
        <button className="new-session" onClick={handleNewSession}>New Session</button>
      </div>
    );
  }

  // Vista del chat para la sesión seleccionada
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Session {selectedSession.slice(0, 3)}</h2>
      </div>
      <button className="back-sessions" onClick={handleBackToSessions}>Back to Sessions</button>
      <div className="messages-container">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {loading && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} disabled={loading} />
    </div>
  );
}

export default ChatInterface;
