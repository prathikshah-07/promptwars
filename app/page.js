export default function HomePage() {
  return (
    <div>
      <section className="sb-gradient-hero text-white py-5">
        <div className="container py-5 text-center">
          <h1 className="display-4 fw-bold mb-3">Smart Bharat</h1>
          <p className="lead mb-4 mx-auto" style={{ maxWidth: '640px' }}>
            Your GenAI-powered civic companion — making government services transparent,
            accessible, and easy to navigate for every citizen, in the language you speak.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <a href="/chat" className="btn btn-light fw-medium px-4 py-2" style={{ color: '#6B21A8' }}>
              <i className="bi bi-chat-dots me-2"></i>Ask the Assistant
            </a>
            <a href="/report" className="btn btn-outline-light fw-medium px-4 py-2">
              <i className="bi bi-megaphone me-2"></i>Report an Issue
            </a>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold" style={{ color: '#4C1D95' }}>How Smart Bharat Helps You</h2>
          <p className="text-muted">Three simple tools, built for everyday civic life.</p>
        </div>
        <div className="row g-4">
          <div className="col-md-4">
            <a href="/chat" className="text-decoration-none">
              <div className="card sb-card p-4 h-100 text-center">
                <div className="mb-3">
                  <i className="bi bi-chat-dots-fill" style={{ fontSize: '2.5rem', color: '#6B21A8' }}></i>
                </div>
                <h5 className="fw-bold" style={{ color: '#4C1D95' }}>AI Chat Assistant</h5>
                <p className="text-muted mb-0">
                  Ask about Aadhaar, PAN, Passport, and 12 other services — get plain-language answers
                  in English, Hindi, or Tamil.
                </p>
              </div>
            </a>
          </div>
          <div className="col-md-4">
            <a href="/report" className="text-decoration-none">
              <div className="card sb-card p-4 h-100 text-center">
                <div className="mb-3">
                  <i className="bi bi-megaphone-fill" style={{ fontSize: '2.5rem', color: '#6B21A8' }}></i>
                </div>
                <h5 className="fw-bold" style={{ color: '#4C1D95' }}>Report Issue</h5>
                <p className="text-muted mb-0">
                  Report civic issues like potholes, water leaks, or power outages. Get an instant
                  tracking ID and priority assessment.
                </p>
              </div>
            </a>
          </div>
          <div className="col-md-4">
            <a href="/track" className="text-decoration-none">
              <div className="card sb-card p-4 h-100 text-center">
                <div className="mb-3">
                  <i className="bi bi-search" style={{ fontSize: '2.5rem', color: '#6B21A8' }}></i>
                </div>
                <h5 className="fw-bold" style={{ color: '#4C1D95' }}>Track Complaint</h5>
                <p className="text-muted mb-0">
                  Enter your tracking ID to see real-time status — from Submitted to In Review to
                  Resolved.
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="container pb-5">
        <div className="row g-4 text-center">
          <div className="col-md-4">
            <i className="bi bi-shield-check" style={{ fontSize: '2rem', color: '#A78BFA' }}></i>
            <h6 className="fw-bold mt-2" style={{ color: '#4C1D95' }}>Transparency</h6>
            <p className="text-muted small">Clear, honest information sourced from official processes.</p>
          </div>
          <div className="col-md-4">
            <i className="bi bi-universal-access" style={{ fontSize: '2rem', color: '#A78BFA' }}></i>
            <h6 className="fw-bold mt-2" style={{ color: '#4C1D95' }}>Accessibility</h6>
            <p className="text-muted small">Designed to work reliably, even with limited connectivity.</p>
          </div>
          <div className="col-md-4">
            <i className="bi bi-translate" style={{ fontSize: '2rem', color: '#A78BFA' }}></i>
            <h6 className="fw-bold mt-2" style={{ color: '#4C1D95' }}>Digital Inclusion</h6>
            <p className="text-muted small">Multilingual support so language is never a barrier.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
