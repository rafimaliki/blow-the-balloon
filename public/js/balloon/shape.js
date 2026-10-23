// The balloon's side profile, as a real one is built: a rolled lip at the opening, a short
// neck tube, then a body that flares smoothly out of the neck into a teardrop. The neck
// keeps its size while the body grows. Pure maths, in centimetres, along +Y from the lips.

const LIP_ROLL = 0.3;        // radius of the rolled rubber ring at the opening
const NECK_RADIUS = 0.65;    // the tube you blow into
const NECK_LENGTH = 3.2;     // lips to where the body starts
const EMPTY_WIDTH = 3.6;     // a flat, empty balloon's width
const EMPTY_LENGTH = 10;     // and its length before air rounds it out
const LIP_STEPS = 8;
const BODY_STEPS = 56;

export const POINTS = LIP_STEPS + 2 + BODY_STEPS;

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Unit teardrop: pointed at u = 0, widest about 60% along, round at the crown (u = 1).
const teardrop = (u) => 0.5 * Math.pow(Math.sin(Math.PI * Math.pow(u, 1.35)), 0.72);

// Rounded max, so the body flares out of the neck instead of creasing into it.
const softMax = (a, b, k) => (a + b + Math.sqrt((a - b) * (a - b) + k * k)) / 2;

// Body length over width: a barely-filled balloon is long and thin, a full one rounder.
const aspectAt = (cm) => 1.9 - 0.65 * smooth(8, 30, cm);

function bodyLength(cm) {
  return Math.max(cm * aspectAt(cm), EMPTY_LENGTH);
}

// Fills r, y and flat (each length POINTS) for a balloon `cm` wide. `flat` is how much of
// the depth survives: an empty balloon is a flat strip, the neck is always round.
export function profile(cm, r, y, flat) {
  const neck = NECK_RADIUS * (1 + 0.25 * smooth(0, 46, cm)); // stretches a little when full
  const width = Math.max(cm, EMPTY_WIDTH);
  const length = bodyLength(cm);
  const emptyFlat = 0.3 + 0.7 * smooth(0, 9, cm);
  let i = 0;

  // Rolled lip: from inside the opening, round the roll, onto the outside of the tube.
  const cx = neck + LIP_ROLL * 0.4;
  for (let s = 0; s < LIP_STEPS; s++) {
    const a = Math.PI + (s / (LIP_STEPS - 1)) * Math.PI * 1.5;
    r[i] = cx + Math.cos(a) * LIP_ROLL;
    y[i] = LIP_ROLL + Math.sin(a) * LIP_ROLL;
    flat[i++] = 1;
  }
  // Neck tube.
  r[i] = neck; y[i] = 2 * LIP_ROLL + 0.2; flat[i++] = 1;
  r[i] = neck; y[i] = NECK_LENGTH; flat[i++] = 1;

  // Body: flares out of the neck, closes at the crown.
  for (let s = 1; s <= BODY_STEPS; s++) {
    const u = s / BODY_STEPS;
    const body = width * teardrop(u);
    r[i] = s === BODY_STEPS ? 0 : softMax(neck, body, 0.4);
    y[i] = NECK_LENGTH + u * length;
    flat[i++] = 1 + (emptyFlat - 1) * smooth(0, 0.15, u);
  }
}
