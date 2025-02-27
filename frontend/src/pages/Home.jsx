import { useState, useEffect } from "react";
import api from "../api";
import Note from "../components/Note";
import ChatInterface from "../components/ChatInterface";
import Calculator from "../components/Calculator"; // Import the new component
import "../styles/Home.css";

function Home() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  // Add a new tab "calc" for the calculator
  const [activeTab, setActiveTab] = useState("chat"); // Default to chat view

  useEffect(() => {
    getNotes();
  }, []);

  const getNotes = () => {
    setLoading(false);
    api
      .get("/api/notes/")
      .then((res) => res.data)
      .then((data) => {
        setNotes(data);
      })
      .catch((err) => alert(err));
  };

  const deleteNote = (id) => {
    api
      .delete(`/api/notes/delete/${id}`)
      .then((res) => {
        if (res.status === 204) alert("Note deleted!");
        else alert("Failed to delete note");
        getNotes();
      })
      .catch((err) => alert(err));
  };

  const createNote = (e) => {
    e.preventDefault();
    api
      .post("/api/notes/", { content, title })
      .then((res) => {
        if (res.status === 201) alert("Note created!");
        else alert("Failed to make note");
        getNotes();
        // Clear form fields after successful creation
        setContent("");
        setTitle("");
      })
      .catch((err) => alert(err));
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <img
          className="logoimg"
          src="/Aimhub.svg"
          width="150"
          height="80"
          alt="AimHub logo"
        />
        <div className="logo">
          <h1>AimHub</h1>
        </div>
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            AimChat
          </button>
          <button
            className={`tab-button ${activeTab === "notes" ? "active" : ""}`}
            onClick={() => setActiveTab("notes")}
          >
            Journal
          </button>
          <button
            className={`tab-button ${activeTab === "tools" ? "active" : ""}`}
            onClick={() => setActiveTab("tools")}
          >
            Tools
          </button>
        </div>
        <div className="user-profile">
          <button
            className="logout-button"
            onClick={() => (window.location.href = "/logout")}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="home-main">
        {activeTab === "chat" ? (
          <ChatInterface />
        ) : activeTab === "notes" ? (
          <div className="notes-container">
            <div className="notes-section">
              <h2 className="section-title">Insights</h2>
              <div className="notes-list">
                {notes.length === 0 ? (
                  <p className="no-notes">No notes yet. Create your first note!</p>
                ) : (
                  notes.map((note) => (
                    <Note note={note} onDelete={deleteNote} key={note.id} />
                  ))
                )}
              </div>
            </div>

            <div className="create-note-section">
              <h2 className="section-title">Create a Note</h2>
              <form onSubmit={createNote} className="note-form">
                <div className="form-group">
                  <label htmlFor="title">Title:</label>
                  <input
                    type="text"
                    id="title"
                    name="Title"
                    required
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    className="form-input"
                    placeholder="Enter note title"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">Content:</label>
                  <textarea
                    id="content"
                    name="content"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="form-textarea"
                    placeholder="Enter note content"
                    rows="6"
                  ></textarea>
                </div>

                <button type="submit" className="submit-button">
                  Create Note
                </button>
              </form>
            </div>
          </div>
        ) : activeTab === "tools" ? (
          <Calculator />
        ) : null}
      </main>

      <footer className="home-footer">
        <p>© 2025 Aim - Your Favorite place for economic insights</p>
      </footer>
    </div>
  );
}

export default Home;

