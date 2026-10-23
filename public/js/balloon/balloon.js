// The latex balloon: a fixed neck at the lips and a body that stretches as it fills.
// The body is a lathe around +Y (neck end at 0, crown at 1) scaled to the live diameter.

import * as THREE from 'three';
import { createLatex } from './latex.js';
import { createShards } from './shards.js';
import { bodyRadius } from './shape.js';

const NECK_LEN = 0.035;      // metres from lips to where the body starts
const TILT = 0.08;           // radians the balloon points up from straight ahead

function profile(segments = 56) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    pts.push(new THREE.Vector2(Math.max(bodyRadius(u), 1e-4), u));
  }
  return pts;
}

function neckProfile() {
  // Rolled lip at the mouth, then a short tube that flares into the body.
  return [
    [0.0115, 0.0], [0.0125, 0.003], [0.0105, 0.006], [0.0085, 0.01],
    [0.0082, 0.022], [0.0095, 0.03], [0.013, 0.037],
  ].map(([r, y]) => new THREE.Vector2(r, y));
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function createBalloon(scene, mouth) {
  const latex = createLatex();

  const root = new THREE.Group();
  root.position.copy(mouth);
  root.rotation.x = -Math.PI / 2 + TILT;
  scene.add(root);

  const neck = new THREE.Mesh(new THREE.LatheGeometry(neckProfile(), 32), latex.neck);
  root.add(neck);

  const bodyGeo = new THREE.LatheGeometry(profile(), 72);
  latex.shadeThickness(bodyGeo);
  const body = new THREE.Mesh(bodyGeo, latex.body);
  body.position.y = NECK_LEN - 0.004;
  root.add(body);

  const shards = createShards(scene, latex.body);

  // Shown size chases the true size on a soft spring, so the rubber overshoots and wobbles.
  let shownCm = 0;
  let velocity = 0;
  let targetCm = 0;

  // An empty balloon is a limp strip of rubber; it keeps that length until the air
  // fills it out, then rounds out as it grows.
  const EMPTY_WIDTH_CM = 3.6;
  const EMPTY_FLAT = 0.3;  // an empty balloon is a flat strip: depth as a share of width
  const EMPTY_LENGTH_CM = 10;
  const DROOP = 0.2; // radians an empty balloon sags below its filled direction
  let droop = 1;

  function applySize(cm) {
    cm = Math.max(0, cm);
    const width = Math.max(cm, EMPTY_WIDTH_CM) / 100;
    const aspect = 1.9 - 0.65 * smooth(8, 30, cm);
    const length = Math.max(cm * aspect, EMPTY_LENGTH_CM) / 100;
    const depth = width * (EMPTY_FLAT + (1 - EMPTY_FLAT) * smooth(0, 9, cm));
    body.scale.set(width, length, depth);
    droop = 1 - smooth(0, 10, cm);
    latex.setStretch(smooth(14, 46, cm));
  }

  return {
    reset(cm) {
      shownCm = targetCm = cm;
      velocity = 0;
      body.visible = true;
      shards.clear();
      applySize(cm);
    },

    setDiameter(cm) { targetCm = cm; },

    pop() {
      body.visible = false;
      shards.burst(body, shownCm / 100);
    },

    update(dtS, tS) {
      const stiffness = 220;
      const damping = 11;
      velocity += ((targetCm - shownCm) * stiffness - velocity * damping) * dtS;
      shownCm += velocity * dtS;
      applySize(shownCm);

      // Small drift, like a balloon held in the lips.
      root.rotation.z = Math.sin(tS * 0.9) * 0.025;
      root.rotation.x = -Math.PI / 2 + TILT - DROOP * droop + Math.sin(tS * 0.6) * 0.015;

      shards.update(dtS);
    },
  };
}
