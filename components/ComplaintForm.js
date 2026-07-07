'use client';

import { useState } from 'react';

const CATEGORIES = ['Auto-detect', 'Roads', 'Water', 'Electricity', 'Sanitation', 'Public Safety', 'Other'];

export default function ComplaintForm() {
  const [form, setForm] = useState({
    name: '',
    location: '',
    category: 'Auto-detect',
    description: '',
  });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setResult(data);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg('Network error — please check your connection and try again.');
    }
  }

  if (status === 'success' && result) {
    return (
      <div className="card sb-card p-4 text-center">
        <div className="mb-3">
          <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem', color: '#6B21A8' }}></i>
        </div>
        <h4 className="fw-bold" style={{ color: '#6B21A8' }}>Complaint Submitted!</h4>
        <p className="text-muted mb-3">Please save your tracking ID to check the status later.</p>
        <div className="p-3 mb-3 rounded" style={{ backgroundColor: '#EDE9FE' }}>
          <div className="small text-muted">Tracking ID</div>
          <div className="fs-4 fw-bold" style={{ color: '#6B21A8', letterSpacing: '1px' }}>
            {result.trackingId}
          </div>
        </div>
        <div className="d-flex justify-content-center gap-3 mb-3 flex-wrap">
          <span className="badge sb-chip px-3 py-2">Category: {result.category}</span>
          <span className="badge sb-chip px-3 py-2">Priority: {result.priority}</span>
        </div>
        {!result.savedToDb && (
          <div className="alert alert-warning small mb-3">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {result.message}
          </div>
        )}
        <a href="/track" className="btn sb-btn-primary text-white">
          Track this complaint <i className="bi bi-arrow-right ms-1"></i>
        </a>
      </div>
    );
  }

  return (
    <form className="card sb-card p-4" onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label fw-medium">Full Name</label>
        <input
          type="text"
          className="form-control"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label fw-medium">Location</label>
        <input
          type="text"
          className="form-control"
          name="location"
          placeholder="e.g. MG Road, Bengaluru"
          value={form.location}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label fw-medium">Category</label>
        <select className="form-select" name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="form-text">Leave as "Auto-detect" to let Smart Bharat suggest a category.</div>
      </div>
      <div className="mb-3">
        <label className="form-label fw-medium">Description</label>
        <textarea
          className="form-control"
          name="description"
          rows="4"
          placeholder="Describe the issue in detail..."
          value={form.description}
          onChange={handleChange}
          required
        ></textarea>
      </div>

      {status === 'error' && (
        <div className="alert alert-danger small">{errorMsg}</div>
      )}

      <button type="submit" className="btn sb-btn-primary text-white w-100 py-2" disabled={status === 'submitting'}>
        {status === 'submitting' ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>Submitting...
          </>
        ) : (
          <>Submit Complaint <i className="bi bi-send ms-1"></i></>
        )}
      </button>
    </form>
  );
}
