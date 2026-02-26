import { describe, expect, it } from 'vitest';
import { pickChampionFromSeeds } from '../../../src/systems/postseason/confTournament';

describe('conference tournament safeguards', () => {
  it('returns null for empty seeds', () => {
    expect(pickChampionFromSeeds([])).toBeNull();
  });

  it('returns top seed when seeds exist', () => {
    expect(pickChampionFromSeeds([42, 11, 9])).toBe(42);
  });
});
