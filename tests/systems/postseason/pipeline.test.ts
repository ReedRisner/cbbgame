import { describe, expect, it } from 'vitest';

describe('postseason pipeline', () => {
  it('module loads', async () => {
    const mod = await import('../../../src/systems/postseason/pipeline');
    expect(typeof mod.runFullPostseason).toBe('function');
  });
});
