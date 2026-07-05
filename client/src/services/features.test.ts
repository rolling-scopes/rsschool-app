import { featureToggles, initializeFeatures } from './features';

describe('features', () => {
  afterEach(() => {
    // restore the default toggle state for isolation
    initializeFeatures({});
  });

  it('exposes the default toggles (feedback enabled)', () => {
    initializeFeatures({});
    expect(featureToggles.feedback).toBe(true);
  });

  it('keeps the default value when the query has no matching key', () => {
    initializeFeatures({ unrelated: 'on' });
    expect(featureToggles.feedback).toBe(true);
  });

  it('disables a feature when the query value is anything other than "on"', () => {
    initializeFeatures({ feedback: 'off' });
    expect(featureToggles.feedback).toBe(false);
  });

  it('enables a feature when the query value is exactly "on"', () => {
    initializeFeatures({ feedback: 'off' });
    expect(featureToggles.feedback).toBe(false);

    initializeFeatures({ feedback: 'on' });
    expect(featureToggles.feedback).toBe(true);
  });

  it('falls back to the default toggle when the query value is undefined', () => {
    initializeFeatures({ feedback: undefined });
    expect(featureToggles.feedback).toBe(true);
  });

  it('resets toggles back to defaults on each call', () => {
    initializeFeatures({ feedback: 'off' });
    expect(featureToggles.feedback).toBe(false);

    initializeFeatures({});
    expect(featureToggles.feedback).toBe(true);
  });

  it('treats an array query value as not equal to "on" and disables the feature', () => {
    initializeFeatures({ feedback: ['on'] });
    expect(featureToggles.feedback).toBe(false);
  });
});
