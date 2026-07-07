'use client';

import { useEffect, useRef, useState } from 'react';
import ChatBubble from '@/components/ChatBubble';

const WELCOME = {
  en: "Hi! I'm your Smart Bharat assistant. Ask me about Aadhaar, PAN, Passport, Voter ID, or any other government service.",
  hi: 'नमस्ते! मैं आपका स्मार्ट भारत सहायक हूँ। आधार, पैन, पासपोर्ट, वोटर आईडी या किसी अन्य सरकारी सेवा के बारे में पूछें।',
  ta: 'வணக்கம்! நான் உங்கள் ஸ்மார்ட் பாரத் உதவியாளர். ஆதார், பான், பாஸ்போர்ட், வாக்காளர் அடையாள அட்டை அல்லது வேறு எந்த அரசு சேவையைப் பற்றியும் கேளுங்கள்.',
};

export default function ChatPage() {
  const [lang, setLang] = useState('en');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('sb_lang') || 'en';
    setLang(stored);
    setMessages([{ role: 'ai', text: WELCOME[stored] || WELCOME.en }]);

    function onLangChange(e) {
      setLang(e.detail);
    }
    window.addEventListener('sb-lang-change', onLangChange);
    return () => window.removeEventListener('sb-lang-change', onLangChange);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, lang }),
      });
      const data = await res.json();

      const note = data.translationUnavailable
        ? lang === 'hi'
          ? 'अनुवाद अस्थायी रूप से अनुपलब्ध — नीचे अंग्रेज़ी में उत्तर दिखाया गया है।'
          : 'மொழிபெயர்ப்பு தற்போது கிடைக்கவில்லை — கீழே ஆங்கிலத்தில் பதில் காட்டப்பட்டுள்ளது.'
        : data.usedFallback
        ? lang === 'hi'
          ? 'त्वरित जवाब (एआई अभी उपलब्ध नहीं)'
          : lang === 'ta'
          ? 'விரைவு பதில் (AI தற்போது கிடைக்கவில்லை)'
          : 'Quick-reference answer (AI momentarily unavailable)'
        : null;

      setMessages((prev) => [...prev, { role: 'ai', text: data.response, note }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: "Sorry, I couldn't reach the server. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <h2 className="fw-bold mb-3" style={{ color: '#4C1D95' }}>
        <i className="bi bi-chat-dots-fill me-2"></i>Chat Assistant
      </h2>
      <div className="card sb-card p-3 p-md-4 mb-3" style={{ minHeight: '55vh' }}>
        <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
          {messages.map((m, idx) => (
            <ChatBubble key={idx} role={m.role} text={m.text} note={m.note} />
          ))}
          {loading && (
            <div className="d-flex justify-content-start mb-3">
              <div className="sb-bubble-ai p-3">
                <span className="spinner-border spinner-border-sm me-2" style={{ color: '#6B21A8' }}></span>
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef}></div>
        </div>
      </div>
      <form className="d-flex gap-2" onSubmit={sendMessage}>
        <input
          type="text"
          className="form-control"
          placeholder="Ask about a government service..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn sb-btn-primary text-white px-4" disabled={loading}>
          <i className="bi bi-send"></i>
        </button>
      </form>
    </div>
  );
}
