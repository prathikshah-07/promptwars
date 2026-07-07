'use client';

import { useState } from 'react';
import StatusCard from '@/components/StatusCard';

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const id = trackingId.trim();
    if (!id) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/track?trackingId=${encodeURIComponent(id)}`);
      const json = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(json.error || 'Could not find that complaint.');
        return;
      }

      setData(json);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg('Network error — please check your connection and try again.');
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: '650px' }}>
      <h2 className="fw-bold mb-1" style={{ color: '#4C1D95' }}>
        <i className="bi bi-search me-2"></i>Track Complaint
      </h2>
      <p className="text-muted mb-4">Enter your tracking ID (e.g. SB-2026-XXXXX) to see the latest status.</p>

      <form className="d-flex gap-2 mb-4" onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-control"
          placeholder="SB-2026-XXXXX"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
        />
        <button type="submit" className="btn sb-btn-primary text-white px-4" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <span className="spinner-border spinner-border-sm"></span>
          ) : (
            <i className="bi bi-search"></i>
          )}
        </button>
      </form>

      {status === 'error' && <div className="alert alert-danger">{errorMsg}</div>}
      {status === 'success' && data && <StatusCard data={data} />}
    </div>
  );
}
