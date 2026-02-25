import { describe, expect, it } from 'vitest';

describe('angular-doctor', () => {
  it('exports diagnose', async () => {
    const { diagnose } = await import('../src/index.js');
    expect(typeof diagnose).toBe('function');
  });
});
