'use client';

import { useEffect, useState } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
];

export default function Navbar() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const stored = window.localStorage.getItem('sb_lang');
    if (stored) setLang(stored);
  }, []);

  function handleLangChange(e) {
    const value = e.target.value;
    setLang(value);
    window.localStorage.setItem('sb_lang', value);
    // Let other components (e.g. chat page) know the language changed.
    window.dispatchEvent(new CustomEvent('sb-lang-change', { detail: value }));
  }

  return (
    <nav className="navbar navbar-expand-lg sb-navbar sticky-top py-3">
      <div className="container">
        <a className="navbar-brand fw-bold" href="/" style={{ color: '#6B21A8' }}>
          <i className="bi bi-flag-fill me-2"></i>Smart Bharat
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sbNavContent"
          aria-controls="sbNavContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="sbNavContent">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <a className="nav-link fw-medium" href="/" style={{ color: '#4C1D95' }}>Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-medium" href="/chat" style={{ color: '#4C1D95' }}>Chat Assistant</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-medium" href="/report" style={{ color: '#4C1D95' }}>Report Issue</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-medium" href="/track" style={{ color: '#4C1D95' }}>Track Complaint</a>
            </li>
            <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
              <select
                className="form-select form-select-sm"
                style={{ borderColor: '#A78BFA', color: '#6B21A8' }}
                value={lang}
                onChange={handleLangChange}
                aria-label="Select language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
