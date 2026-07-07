// Pure, dependency-free logic for complaint triage and tracking ID generation.
// Extracted from app/api/report/route.js so it can be unit tested directly.

export const HIGH_PRIORITY_KEYWORDS = [
  'overflow', 'danger', 'dangerous', 'accident', 'fire', 'collapse', 'collapsed',
  'electrocution', 'shock', 'live wire', 'gas leak', 'flood', 'flooding',
  'injury', 'injured', 'emergency', 'explosion', 'blocked road', 'sewage overflow',
];

export const CATEGORY_KEYWORDS = {
  Roads: ['road', 'pothole', 'street', 'highway', 'footpath', 'pavement', 'traffic signal'],
  Water: ['water', 'pipeline', 'leak', 'sewage', 'drainage', 'tap', 'supply'],
  Electricity: ['electric', 'power', 'transformer', 'wire', 'streetlight', 'outage', 'voltage'],
  Sanitation: ['garbage', 'trash', 'waste', 'sanitation', 'sewer', 'toilet', 'cleanliness', 'dump'],
  'Public Safety': ['safety', 'crime', 'accident', 'danger', 'theft', 'harassment', 'unsafe'],
};

export function keywordSuggest(description) {
  const text = (description || '').toLowerCase();

  let category = 'Other';
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      category = cat;
      break;
    }
  }

  const priority = HIGH_PRIORITY_KEYWORDS.some((kw) => text.includes(kw)) ? 'High' : 'Medium';

  return { category, priority };
}

export function generateTrackingId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // avoids ambiguous chars
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SB-2026-${suffix}`;
}
