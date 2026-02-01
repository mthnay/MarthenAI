import { useState, useRef, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:8000';

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Merhaba! Ben Marthen. Python tabanlı yeni beynimle artık çok daha güçlüyüm. Nasıl yardımcı olabilirim?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  // Backend durumunu kontrol et
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/`);
        if (res.ok) setBackendStatus('online');
        else setBackendStatus('offline');
      } catch (e) {
        setBackendStatus('offline');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error('Backend yanıt vermedi');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Üzgünüm, Python beynime bağlanırken bir sorun oluştu. Lütfen backend'in çalıştığından emin ol."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">M</div>
            <h1>Marthen</h1>
          </div>
          <button className="new-chat-btn" onClick={() => setMessages([{ role: 'assistant', content: 'Yeni sohbet başladı. Sana nasıl yardımcı olabilirim?' }])}>
            + Yeni Sohbet
          </button>
        </div>

        <div className="history-section">
          <p className="section-title">Durum</p>
          <div className={`history-item ${backendStatus}`}>
            {backendStatus === 'online' ? '🟢 Python Backend Aktif' :
              backendStatus === 'checking' ? '🟡 Kontrol Ediliyor...' : '🔴 Backend Kapalı'}
          </div>
          <div className="history-item">Profesyonel Mod (Python)</div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">U</div>
            <span>Kullanıcı</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="main-content">
        <header className="chat-header">
          <div className="model-selector">
            <span>Marthen Engine (Python Backend)</span>
          </div>
        </header>

        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.role}`}>
              <div className="message-content">
                <div className="message-avatar">
                  {msg.role === 'assistant' ? 'M' : 'U'}
                </div>
                <div className="message-text">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-wrapper assistant">
              <div className="message-content">
                <div className="message-avatar">M</div>
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <form className="input-wrapper" onSubmit={handleSend}>
            <input
              type="text"
              placeholder={backendStatus === 'online' ? "Marthen'e sor..." : "Backend başlatılıyor..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={backendStatus !== 'online' || isTyping}
            />
            <button type="submit" disabled={!input.trim() || backendStatus !== 'online' || isTyping}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
          <p className="input-footer">Marthen Python Backend üzerinde çalışıyor. Donanım hızlandırma aktif.</p>
        </div>
      </main>
    </div>
  )
}

export default App

