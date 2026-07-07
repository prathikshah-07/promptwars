export default function ChatBubble({ role, text, note }) {
  const isUser = role === 'user';
  return (
    <div className={`d-flex mb-3 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}>
      <div
        className={`p-3 ${isUser ? 'sb-bubble-user' : 'sb-bubble-ai'}`}
        style={{ maxWidth: '75%', whiteSpace: 'pre-wrap' }}
      >
        {!isUser && (
          <div className="small fw-bold mb-1" style={{ color: '#6B21A8' }}>
            <i className="bi bi-stars me-1"></i>Smart Bharat
          </div>
        )}
        <div>{text}</div>
        {note && (
          <div className="small mt-2 opacity-75" style={{ fontStyle: 'italic' }}>
            {note}
          </div>
        )}
      </div>
    </div>
  );
}
