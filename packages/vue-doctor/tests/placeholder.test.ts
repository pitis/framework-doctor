import { describe, expect, it } from 'vitest';

describe('vue-doctor', () => {
  it('exports diagnose', async () => {
    const { diagnose } = await import('../src/index.js');
    expect(typeof diagnose).toBe('function');
  });
});
