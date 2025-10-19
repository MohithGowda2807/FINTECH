import { useState } from 'react';
import styles from '../styles/Chatbot.module.css';

export default function FinanceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your Finance Assistant. Ask me about SIP, investments, or how to use our calculators!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const responses = {
    'sip': "SIP (Systematic Investment Plan) lets you invest a fixed amount regularly in mutual funds. Use our SIP Calculator to see potential returns!",
    'lumpsum': "Lumpsum is a one-time investment. Our Lumpsum Calculator helps you estimate future value based on expected returns.",
    'step-up': "Step-Up SIP increases your investment amount periodically. This helps beat inflation and grow wealth faster!",
    'portfolio': "Use our Portfolio Analyzer to track your investments and see performance metrics like XIRR and total returns.",
    'money tracker': "Track your income and expenses with our Money Tracker. It helps you understand spending patterns.",
    'calculator': "We have 6 calculators: SIP, Lumpsum, Lumpsum+SIP, Step-Up SIP, Portfolio Analyzer, and Money Tracker!",
    'how to use': "Login first, then click on any calculator tab. Enter your investment details and click 'Calculate' to see results!",
    'return': "Expected returns depend on market conditions. Historically, equity mutual funds return 10-12% annually over long periods.",
    'best investment': "The best investment depends on your goals, risk appetite, and time horizon. SIP is great for beginners!",
    'risk': "All investments carry risk. Diversify your portfolio and invest for the long term to manage risk better.",
    'help': "I can help with: SIP, Lumpsum, Step-Up SIP, Portfolio tracking, Money management, and using our calculators!"
  };

  const getResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    for (let key in responses) {
      if (input.includes(key)) {
        return responses[key];
      }
    }
    
    return "I can help you with SIP, Lumpsum investments, calculators, and money management. Try asking about any of these topics!";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    const botMessage = { text: getResponse(input), sender: 'bot' };

    setMessages([...messages, userMessage, botMessage]);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button className={styles.chatButton} onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <span>🤖 Finance Assistant</span>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          {/* Messages */}
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
          </div>

          {/* Input */}
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
