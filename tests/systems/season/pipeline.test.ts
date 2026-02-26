import { describe, expect, it } from 'vitest';

describe('season pipeline', () => {
  it('module loads', async () => {
    const mod = await import('../../../src/systems/season/pipeline');
    expect(typeof mod.runFullSeason).toBe('function');
  });
});
