import { describe, expect, it } from 'vitest';

describe('weekly pipeline', () => {
  it('module loads', async () => {
    const mod = await import('../../../src/systems/rankings/weeklyPipeline');
    expect(typeof mod.runWeeklyRankings).toBe('function');
  });
});
