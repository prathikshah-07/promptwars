import govtServices, { findMatchingService } from '@/lib/govtServices';

describe('govtServices data', () => {
  it('contains exactly 15 hardcoded services', () => {
    expect(govtServices).toHaveLength(15);
  });

  it('every service has the required fields', () => {
    govtServices.forEach((service) => {
      expect(service.name).toEqual(expect.any(String));
      expect(service.authority).toEqual(expect.any(String));
      expect(Array.isArray(service.requiredDocs)).toBe(true);
      expect(service.requiredDocs.length).toBeGreaterThan(0);
      expect(Array.isArray(service.processSteps)).toBe(true);
      expect(service.processSteps.length).toBeGreaterThan(0);
      expect(service.portalUrl).toMatch(/^https?:\/\//);
    });
  });
});

describe('findMatchingService', () => {
  it('matches Aadhaar-related queries', () => {
    expect(findMatchingService('How do I apply for an aadhaar card?').name).toBe('Aadhaar Card');
    expect(findMatchingService('lost my aadhar, need a new one').name).toBe('Aadhaar Card');
  });

  it('matches PAN card queries', () => {
    expect(findMatchingService('what documents for a PAN card')?.name).toBe('PAN Card');
  });

  it('matches Voter ID queries', () => {
    expect(findMatchingService('how to register as a voter')?.name).toBe('Voter ID Card');
  });

  it('matches Driving License queries regardless of spelling variant', () => {
    expect(findMatchingService('I need a driving licence renewal')?.name).toBe('Driving License');
  });

  it('matches Disability Certificate via UDID keyword', () => {
    expect(findMatchingService('how to get my UDID card')?.name).toBe('Disability Certificate');
  });

  it('returns null for unrelated or empty queries', () => {
    expect(findMatchingService('what is the weather today')).toBeNull();
    expect(findMatchingService('')).toBeNull();
    expect(findMatchingService(undefined)).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(findMatchingService('PASSPORT APPLICATION')?.name).toBe('Passport');
  });
});
