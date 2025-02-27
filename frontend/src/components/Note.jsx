import React from "react";
import "../styles/Note.css";

function Note({ note, onDelete }) {
  const formattedDate = new Date(note.created_at).toLocaleDateString("en-US");

  return (
    <div className="note-card">
      <div className="note-header">
        <h3 className="note-title">{note.title}</h3>
        <button className="delete-button" onClick={() => onDelete(note.id)}>
          Delete note
        </button>
      </div>
      <div className="note-content">
        <p>{note.content}</p>
      </div>
      <div className="note-footer">
        <span className="note-date">{formattedDate}</span>
      </div>
    </div>
  );
}
export default Note;
