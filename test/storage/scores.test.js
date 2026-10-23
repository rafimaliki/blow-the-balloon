import assert from 'node:assert/strict';
import { loadBest, recordScore } from '../../public/js/storage/scores.js';

const memory = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
};
const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };

{
  const s = memory();
  assert.equal(loadBest(s), 0);
  assert.equal(recordScore(s, 30), true);
  assert.equal(loadBest(s), 30);
  assert.equal(recordScore(s, 25), false);
  assert.equal(recordScore(s, 30), false);
  assert.equal(loadBest(s), 30);
  assert.equal(recordScore(s, 0), false);
  assert.equal(recordScore(s, 30.4), true);
  assert.equal(loadBest(s), 30.4);
}

// Missing or throwing storage never breaks the game.
assert.equal(loadBest(broken), 0);
assert.equal(recordScore(broken, 12), true);
assert.equal(loadBest(undefined), 0);
assert.equal(recordScore(undefined, 12), true);
