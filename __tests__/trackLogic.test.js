import { computeStatus } from '@/lib/trackLogic';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

describe('computeStatus', () => {
  it('returns Submitted for a complaint filed today', () => {
    expect(computeStatus(daysAgo(0))).toBe('Submitted');
  });

  it('returns Submitted for a complaint filed 1 day ago', () => {
    expect(computeStatus(daysAgo(1))).toBe('Submitted');
  });

  it('returns In Review for a complaint filed 2 days ago', () => {
    expect(computeStatus(daysAgo(2))).toBe('In Review');
  });

  it('returns In Review for a complaint filed 6 days ago', () => {
    expect(computeStatus(daysAgo(6))).toBe('In Review');
  });

  it('returns Resolved for a complaint filed exactly 7 days ago', () => {
    expect(computeStatus(daysAgo(7))).toBe('Resolved');
  });

  it('returns Resolved for a complaint filed well over 7 days ago', () => {
    expect(computeStatus(daysAgo(30))).toBe('Resolved');
  });
});
