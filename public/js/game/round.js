// One round of blowing: ready -> blowing -> released | popped.
// Pure: no DOM, no Three.js, so it runs under `node --test`.

// Tuned by feel. Volume is what the player adds and is scored on; the burst point is
// set by diameter, because that is how far the rubber stretches.
export const TUNING = {
  startVolumeL: 0,        // empty: every bit of size is the player's breath
  airflowLps: 5.5,        // litres per second while holding
  puffHz: 2.2,            // airflow wobbles at this rate so a breath feels organic
  puffDepth: 0.35,        // 0 = steady stream, 1 = full stop between puffs
  burstMinCm: 26,         // hidden burst diameter is drawn uniformly from this range
  burstMaxCm: 46,
};

const CM3_PER_L = 1000;

export function diameterCm(volumeL) {
  // Treated as a sphere of the same volume; the mesh stretches it into a balloon shape.
  return Math.cbrt((6 * volumeL * CM3_PER_L) / Math.PI);
}

export function createRound(random = Math.random, t = TUNING) {
  return {
    state: 'ready',
    volumeL: t.startVolumeL,
    elapsedS: 0,
    burstCm: t.burstMinCm + random() * (t.burstMaxCm - t.burstMinCm),
  };
}

// Advances the round by dtS seconds. Returns the same object, mutated.
export function step(round, dtS, holding, t = TUNING) {
  if (round.state === 'ready' && holding) round.state = 'blowing';
  if (round.state !== 'blowing') return round;

  if (!holding) {
    round.state = 'released';
    return round;
  }

  round.elapsedS += dtS;
  const puff = 1 - t.puffDepth * (0.5 + 0.5 * Math.sin(round.elapsedS * t.puffHz * 2 * Math.PI));
  round.volumeL += t.airflowLps * puff * dtS;
  if (diameterCm(round.volumeL) >= round.burstCm) round.state = 'popped';
  return round;
}

export function isOver(round) {
  return round.state === 'released' || round.state === 'popped';
}

export function score(round) {
  // Litres, to one decimal.
  return round.state === 'popped' ? 0 : Math.round(round.volumeL * 10) / 10;
}
