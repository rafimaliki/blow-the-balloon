import assert from 'node:assert/strict';
import { POINTS, profile } from '../../public/js/balloon/shape.js';

const at = (cm) => {
  const r = new Float32Array(POINTS);
  const y = new Float32Array(POINTS);
  const flat = new Float32Array(POINTS);
  profile(cm, r, y, flat);
  return { r, y, flat };
};

for (const cm of [0, 10, 30, 46]) {
  const { r, y } = at(cm);
  // The opening is a ring, not a point: the profile starts away from the axis.
  assert.ok(r[0] > 0.3, `opening has a real radius at ${cm} cm`);
  // Only the crown closes.
  for (let i = 0; i < POINTS - 1; i++) assert.ok(r[i] > 0, `radius > 0 at point ${i}, ${cm} cm`);
  assert.equal(r[POINTS - 1], 0);
  // From the neck on, the profile only moves away from the lips.
  for (let i = 9; i < POINTS; i++) assert.ok(y[i] > y[i - 1], `y increases at point ${i}, ${cm} cm`);
}

// The neck keeps roughly its size while the body grows a lot.
const small = at(10);
const big = at(46);
const neckIndex = 9;
assert.ok(big.r[neckIndex] / small.r[neckIndex] < 1.3, 'neck barely stretches');
assert.ok(Math.max(...big.r) / Math.max(...small.r) > 3, 'body grows');
assert.ok(Math.abs(Math.max(...big.r) * 2 - 46) < 2, 'widest point matches the diameter');

// An empty balloon is flat; a filled one is round.
assert.ok(at(0).flat[POINTS - 10] < 0.5);
assert.equal(at(30).flat[POINTS - 10], 1);
