export default function Footer() {
  return (
    <footer className="sb-gradient-hero text-white py-4 mt-auto">
      <div className="container text-center">
        <div className="fw-bold mb-1"><i className="bi bi-flag-fill me-2"></i>Smart Bharat</div>
        <div className="small opacity-75">Built by Team Smart Bharat &mdash; GenAI Civic Companion</div>
        <div className="small opacity-50 mt-1">&copy; {new Date().getFullYear()} Smart Bharat. For hackathon demonstration purposes.</div>
      </div>
    </footer>
  );
}
