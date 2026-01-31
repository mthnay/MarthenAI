import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Merhaba! Ben Marthen. Kendi bilgisayarında çalışan, tamamen sana ait yerel yapay zekanım. İlk kurulum için bir şey yazman yeterli (Biraz zaman alabilir)!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Worker referansı
  const worker = useRef(null);

  useEffect(() => {
    // Worker'ı başlat
    if (!worker.current) {
      // Worker public klasöründen çağrılıyor
      worker.current = new Worker('/worker.js', {
        type: 'module'
      });
    }

    // Worker'dan gelen mesajları dinle
    const onMessageReceived = (e) => {
      const { status, output, error } = e.data;

      if (status === 'complete') {
        const aiResponse = output || "Anlamadım, tekrar eder misin?";
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        setIsTyping(false);
        setIsModelLoading(false);
      } else if (status === 'error') {
        setMessages(prev => [...prev, { role: 'assistant', content: "Bir hata oluştu: " + error }]);
        setIsTyping(false);
        setIsModelLoading(false);
      }
    };

    worker.current.addEventListener('message', onMessageReceived);

    return () => {
      worker.current.removeEventListener('message', onMessageReceived);
    }
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

    // İlk mesajda kullanıcıyı bilgilendir
    if (!isModelLoading && messages.length === 1) {
      setIsModelLoading(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "🧠 Beynim yükleniyor... Bu işlem ilk seferde 1-2 dakika sürebilir, lütfen tarayıcıyı kapatma."
      }]);
    }

    // Mesajı worker'a gönder
    worker.current.postMessage({ text: input });
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
          <button className="new-chat-btn">+ Yeni Sohbet</button>
        </div>

        <div className="history-section">
          <p className="section-title">Durum</p>
          <div className={`history-item ${isModelLoading ? 'active' : ''}`}>
            {isModelLoading ? '🟡 Model Yükleniyor' : '🟢 Hazır'}
          </div>
          <div className="history-item">Yerel Zeka (Offline)</div>
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
            <span>Marthen Local (LaMini-Flan-T5)</span>
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
          {isTyping && !isModelLoading && (
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
              placeholder={isModelLoading ? "Beyin yükleniyor..." : "Marthen'e yerel olarak sor..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isModelLoading}
            />
            <button type="submit" disabled={!input.trim() || isModelLoading}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
          <p className="input-footer">Marthen tamamen senin cihazında çalışır. Verilerin dışarı çıkmaz.</p>
        </div>
      </main>
    </div>
  )
}

export default App
