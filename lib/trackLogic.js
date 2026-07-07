// Pure date-math logic for complaint status. Extracted from
// app/api/track/route.js so it can be unit tested directly, with no AI or
// database dependency — this is deliberately the most bulletproof part of
// the app.

export function computeStatus(timestamp) {
  const created = new Date(timestamp);
  const now = new Date();
  const daysElapsed = Math.floor((now - created) / (1000 * 60 * 60 * 24));

  if (daysElapsed >= 7) return 'Resolved';
  if (daysElapsed >= 2) return 'In Review';
  return 'Submitted';
}
