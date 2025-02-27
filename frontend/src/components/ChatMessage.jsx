import React from "react";
import "../styles/ChatMessage.css";

function ChatMessage({ message }) {
  const { text, sender, timestamp, data, isError } = message;

  // Format timestamp
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

  return (
    <div
      className={`message ${sender === "user" ? "user-message" : "bot-message"} ${isError ? "error-message" : ""}`}
    >
      <div className="message-content">
        <p>{text}</p>

        {/* If we have additional data (like economic indicators), render them */}
        {data && data.indicators && (
          <div className="economic-indicators">
            <h4>Economic Indicators:</h4>
            <ul>
              {Object.entries(data.indicators).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* If we have references, render them */}
        {data && data.references && (
          <div className="references">
            <h4>References:</h4>
            <ul>
              {data.references.map((ref, index) => (
                <li key={index}>{ref}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="message-timestamp">{formattedTime}</div>
    </div>
  );
}

export default ChatMessage;
