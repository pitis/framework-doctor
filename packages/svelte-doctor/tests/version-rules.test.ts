import { describe, expect, it } from 'vitest';
import { ruleEnabledForVersion } from '../src/utils/version-rules.js';

describe('ruleEnabledForVersion', () => {
  it('enables when version is within the range', () => {
    expect(ruleEnabledForVersion({ minVersion: '5.0.0' }, '^5.12.3')).toBe(true);
  });

  it('disables when version is below minVersion', () => {
    expect(ruleEnabledForVersion({ minVersion: '5.0.0' }, '^4.2.0')).toBe(false);
  });

  it('disables when version is above maxVersion', () => {
    expect(ruleEnabledForVersion({ maxVersion: '5.9.0' }, '^5.10.0')).toBe(false);
  });
});
