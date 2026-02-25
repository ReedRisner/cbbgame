export function normalRandom(mean = 0, stdDev = 1): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
}

export function clampedNormal(mean: number, stdDev: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, normalRandom(mean, stdDev)));
}

export function weightedChoice<T>(options: T[], weights: number[]): T {
  if (options.length !== weights.length || options.length === 0) {
    throw new Error('Options and weights must have the same non-zero length.');
  }

  const total = weights.reduce((sum, w) => sum + w, 0);
  const roll = normalRandom(total / 2, total / 6);
  let running = 0;
  for (let i = 0; i < options.length; i += 1) {
    running += weights[i];
    if (roll <= running) {
      return options[i];
    }
  }
  return options[options.length - 1];
}
