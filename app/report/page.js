import ComplaintForm from '@/components/ComplaintForm';

export default function ReportPage() {
  return (
    <div className="container py-4" style={{ maxWidth: '650px' }}>
      <h2 className="fw-bold mb-1" style={{ color: '#4C1D95' }}>
        <i className="bi bi-megaphone-fill me-2"></i>Report an Issue
      </h2>
      <p className="text-muted mb-4">
        Tell us what's wrong in your area — we'll suggest a category and priority automatically.
      </p>
      <ComplaintForm />
    </div>
  );
}
