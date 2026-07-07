const STEPS = ['Submitted', 'In Review', 'Resolved'];

export default function StatusCard({ data }) {
  const currentIndex = STEPS.indexOf(data.status);

  return (
    <div className="card sb-card p-4">
      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
        <div>
          <div className="small text-muted">Tracking ID</div>
          <div className="fs-5 fw-bold" style={{ color: '#6B21A8' }}>{data.trackingId}</div>
        </div>
        <span className="badge sb-chip px-3 py-2">{data.priority} Priority</span>
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between position-relative">
          {STEPS.map((step, idx) => (
            <div key={step} className="text-center flex-fill position-relative">
              <div
                className="mx-auto rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: idx <= currentIndex ? '#6B21A8' : '#E9D8FD',
                  color: idx <= currentIndex ? '#fff' : '#6B21A8',
                  fontWeight: 'bold',
                  zIndex: 1,
                  position: 'relative',
                }}
              >
                {idx < currentIndex ? <i className="bi bi-check-lg"></i> : idx + 1}
              </div>
              <div className="small mt-2" style={{ color: idx <= currentIndex ? '#6B21A8' : '#9CA3AF' }}>
                {step}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 18,
                    left: '50%',
                    width: '100%',
                    height: 3,
                    backgroundColor: idx < currentIndex ? '#6B21A8' : '#E9D8FD',
                    zIndex: 0,
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-sm-6">
          <div className="small text-muted">Category</div>
          <div className="fw-medium">{data.category}</div>
        </div>
        <div className="col-sm-6">
          <div className="small text-muted">Location</div>
          <div className="fw-medium">{data.location}</div>
        </div>
        <div className="col-12">
          <div className="small text-muted">Description</div>
          <div>{data.description}</div>
        </div>
        <div className="col-12">
          <div className="small text-muted">Submitted On</div>
          <div>{new Date(data.submittedAt).toLocaleString('en-IN')}</div>
        </div>
      </div>
    </div>
  );
}
