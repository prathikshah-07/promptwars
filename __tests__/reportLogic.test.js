import { keywordSuggest, generateTrackingId } from '@/lib/reportLogic';

describe('keywordSuggest', () => {
  it('flags fire/danger/accident language as High priority', () => {
    expect(keywordSuggest('There is a fire near the transformer').priority).toBe('High');
    expect(keywordSuggest('This is dangerous, sparks flying everywhere').priority).toBe('High');
    expect(keywordSuggest('A bad accident happened here yesterday').priority).toBe('High');
  });

  it('defaults to Medium priority when no high-severity keywords are present', () => {
    expect(keywordSuggest('The streetlight has been off for two days').priority).toBe('Medium');
    expect(keywordSuggest('').priority).toBe('Medium');
  });

  it('detects Roads category from pothole/road language', () => {
    expect(keywordSuggest('There is a large pothole on the main road').category).toBe('Roads');
  });

  it('detects Water category from leak/pipeline language', () => {
    expect(keywordSuggest('Water pipeline is leaking near the market').category).toBe('Water');
  });

  it('detects Electricity category from transformer/power language', () => {
    expect(keywordSuggest('Power outage and a damaged transformer near our house').category).toBe('Electricity');
  });

  it('detects Sanitation category from garbage/waste language', () => {
    expect(keywordSuggest('Garbage has not been collected in a week, waste piling up').category).toBe('Sanitation');
  });

  it('falls back to Other when no category keywords match', () => {
    expect(keywordSuggest('Something strange is happening in my neighborhood').category).toBe('Other');
  });

  it('handles missing/undefined description without throwing', () => {
    expect(() => keywordSuggest(undefined)).not.toThrow();
    expect(keywordSuggest(undefined)).toEqual({ category: 'Other', priority: 'Medium' });
  });
});

describe('generateTrackingId', () => {
  it('follows the SB-2026-XXXXX format with 5 unambiguous alphanumeric characters', () => {
    const id = generateTrackingId();
    expect(id).toMatch(/^SB-2026-[A-HJ-NP-Z2-9]{5}$/);
  });

  it('does not include ambiguous characters like 0, 1, I, O', () => {
    for (let i = 0; i < 50; i++) {
      const id = generateTrackingId();
      const suffix = id.split('-')[2];
      expect(suffix).not.toMatch(/[01IO]/);
    }
  });

  it('generates different IDs across calls (extremely low collision chance)', () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateTrackingId()));
    expect(ids.size).toBeGreaterThan(1);
  });
});
