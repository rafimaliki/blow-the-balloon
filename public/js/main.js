// Entry: wires the modules together and runs the frame loop. Game rules live in game/.

import { createStage, MOUTH } from './scene/stage.js';
import { createBalloon } from './balloon/balloon.js';
import { createHold } from './input/hold.js';
import { createOverlay } from './ui/overlay.js';
import { createSfx } from './audio/sfx.js';
import { createRound, step, isOver, score, diameterCm, TUNING } from './game/round.js';
import { loadBest, recordScore } from './storage/scores.js';

const RESULT_DELAY_MS = { released: 500, popped: 900 }; // let the moment land first

const storage = (() => { try { return localStorage; } catch { return undefined; } })();
const stage = createStage(document.getElementById('stage'));
const balloon = createBalloon(stage.scene, MOUTH);
const sfx = createSfx();
const overlay = createOverlay(document, { onAgain: newRound });

let round;
// A round only starts blowing on a fresh press, so a hold carried over from the
// previous round (e.g. Space used to restart) does not blow by accident.
let armed;

const hold = createHold(document.getElementById('play'), {
  onPress() {
    sfx.unlock();
    if (overlay.isResultShown()) newRound();
    else if (round.state === 'ready') armed = true;
  },
});

// iOS Safari only unlocks audio on some gestures; a release counts where a press may not.
addEventListener('pointerup', sfx.unlock);

function newRound() {
  round = createRound();
  armed = false;
  balloon.reset(diameterCm(round.volumeL));
  overlay.hideResult();
}

function endRound() {
  const popped = round.state === 'popped';
  if (popped) {
    balloon.pop();
    sfx.pop();
    stage.shake(0.02);
    navigator.vibrate?.(70);
  }
  const s = score(round);
  const isNewBest = recordScore(storage, s);
  setTimeout(() => {
    overlay.setBest(loadBest(storage));
    overlay.showResult({ score: s, bestScore: loadBest(storage), isNewBest, popped });
  }, RESULT_DELAY_MS[round.state]);
}

let last = performance.now();
function frame(now) {
  const dtS = Math.min(0.05, (now - last) / 1000);
  last = now;
  const tS = now / 1000;

  const wasBlowing = round.state === 'blowing';
  const volumeBefore = round.volumeL;
  step(round, dtS, armed && hold.isHolding());

  overlay.setHolding(round.state === 'blowing');
  sfx.breathe(round.state === 'blowing' && dtS > 0 ? (round.volumeL - volumeBefore) / dtS / TUNING.airflowLps : 0);
  balloon.setDiameter(diameterCm(round.volumeL));
  if (wasBlowing && isOver(round)) endRound();

  balloon.update(dtS, tS);
  stage.update(dtS, tS);
  stage.render();
  requestAnimationFrame(frame);
}

overlay.setBest(loadBest(storage));
newRound();
requestAnimationFrame(frame);
