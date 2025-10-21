import { useState } from 'react';
import styles from '../styles/Chatbot.module.css';

export default function FinanceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm your Finance Assistant powered by Google Gemini AI. Ask me about SIP, investments, or how to use our calculators!",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // GOOGLE GEMINI API KEY (replace this value!)
  const API_KEY = "AIzaSyBYacM9fPyA5e9GS7YIDwQ3fQ0UcvsUsCc";

  // Handle message send
  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Call Gemini API directly
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: input }]
              }
            ]
          }),
        }
      );

      const data = await response.json();

      // Extract model reply safely
      const botMessage = {
        text:
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, I couldn’t generate a response.",
        sender: 'bot'
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error('Gemini API error:', error);
      const errorMessage = {
        text:
          'Sorry, Gemini AI is temporarily unreachable. Please try again later.',
        sender: 'bot'
      };

      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 500);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating Chat Icon */}
      {!isOpen && (
        <button className={styles.chatButton} onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <span>🤖 Finance Assistant (Gemini AI)</span>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          {/* Messages Section */}
          <div className={styles.chatMessages}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${styles.message} ${
                  msg.sender === 'user' ? styles.userMessage : styles.botMessage
                }`}
              >
                {msg.text}
              </div>
            ))}

            {isTyping && (
              <div className={`${styles.message} ${styles.botMessage}`}>
                <span style={{ fontStyle: 'italic', color: '#999' }}>
                  AI is thinking...
                </span>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className={styles.chatInput}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about finance..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
