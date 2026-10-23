import assert from 'node:assert/strict';
import { createRound, step, score, isOver, diameterCm, TUNING } from '../../public/js/game/round.js';

const fixed = (v) => () => v;
const blowFor = (round, seconds, dt = 1 / 60) => {
  for (let s = 0; s < seconds && !isOver(round); s += dt) step(round, dt, true);
  return round;
};

// Burst point stays inside the configured range.
assert.equal(createRound(fixed(0)).burstCm, TUNING.burstMinCm);
assert.equal(createRound(fixed(0.999999)).burstCm.toFixed(3), TUNING.burstMaxCm.toFixed(3));

// Nothing happens until the player holds.
{
  const r = createRound(fixed(0.5));
  step(r, 1, false);
  assert.equal(r.state, 'ready');
  assert.equal(r.volumeL, TUNING.startVolumeL);
}

// Holding grows the balloon; releasing ends the round with a positive score.
{
  const r = createRound(fixed(1));
  blowFor(r, 1);
  assert.equal(r.state, 'blowing');
  assert.ok(r.volumeL > TUNING.startVolumeL);
  step(r, 1 / 60, false);
  assert.equal(r.state, 'released');
  assert.equal(score(r), Math.round(r.volumeL * 10) / 10);
  assert.ok(score(r) > 0);
  assert.equal(score(r), Number(score(r).toFixed(1)), 'score has at most one decimal');
}

// One breath per round: holding again after release does not resume.
{
  const r = createRound(fixed(1));
  blowFor(r, 0.5);
  step(r, 1 / 60, false);
  const v = r.volumeL;
  step(r, 1, true);
  assert.equal(r.state, 'released');
  assert.equal(r.volumeL, v);
}

// Holding too long pops it, and a popped balloon scores 0.
{
  const r = createRound(fixed(0));
  blowFor(r, 60);
  assert.equal(r.state, 'popped');
  assert.equal(score(r), 0);
  assert.ok(diameterCm(r.volumeL) >= TUNING.burstMinCm);
}

// The largest burst point is reachable in a reasonable time (game stays snappy).
{
  const r = createRound(fixed(0.999999));
  blowFor(r, 20);
  assert.equal(r.state, 'popped');
  assert.ok(r.elapsedS < 15, `took ${r.elapsedS.toFixed(1)}s to reach max burst`);
}
