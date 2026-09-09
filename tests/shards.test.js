// The CI matrix runs one job per group in e2e/shards.js. A spec file missing
// from every group would run nowhere and pass silently, so check the mapping
// against what is actually on disk.
import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SHARDS } from '../e2e/shards.js';

const specs = readdirSync(fileURLToPath(new URL('../e2e', import.meta.url))).filter((f) =>
  f.endsWith('.spec.js'),
);
const assigned = Object.values(SHARDS).flat();

describe('e2e shard groups', () => {
  it('covers every spec file on disk', () => {
    expect([...specs].sort()).toEqual([...assigned].sort());
  });

  it('assigns each spec to exactly one group', () => {
    const seen = assigned.filter((f, i) => assigned.indexOf(f) !== i);
    expect(seen).toEqual([]);
  });

  it('has no empty group', () => {
    for (const [name, files] of Object.entries(SHARDS))
      expect(files.length, name).toBeGreaterThan(0);
  });
});
