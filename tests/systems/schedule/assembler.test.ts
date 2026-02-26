import { describe, expect, it } from 'vitest';

describe('schedule assembler', () => {
  it('module loads', async () => {
    const mod = await import('../../../src/systems/schedule/assembler');
    expect(typeof mod.generateFullSchedule).toBe('function');
  });
});
