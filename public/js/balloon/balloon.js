// The latex balloon mesh: one lathe surface from the lips to the crown, reshaped every
// frame from shape.js so the neck stays its real size while the body fills.

import * as THREE from 'three';
import { createLatex } from './latex.js';
import { createShards } from './shards.js';
import { POINTS, profile } from './shape.js';

const SEGMENTS = 64;
const TILT = 0.35;   // radians the balloon points up from straight ahead
const DROOP = 0.5;   // radians an empty balloon sags below that
const CM = 0.01;

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function createBalloon(scene, mouth) {
  const latex = createLatex();

  const root = new THREE.Group();
  root.position.copy(mouth);
  scene.add(root);

  // Built once at full resolution, then only its positions are rewritten.
  const seed = Array.from({ length: POINTS }, (_, i) => new THREE.Vector2(1, i));
  const geometry = new THREE.LatheGeometry(seed, SEGMENTS);
  const pos = geometry.attributes.position;
  const r = new Float32Array(POINTS);
  const y = new Float32Array(POINTS);
  const flat = new Float32Array(POINTS);

  // Thick rubber at the lip and neck reads darker than the stretched body.
  const colors = new Float32Array(pos.count * 3);
  for (let v = 0; v < pos.count; v++) {
    const j = v % POINTS;
    const k = j < 10 ? 0.72 : 0.8 + 0.2 * Math.min(1, (j - 10) / 14);
    colors.set([k, k, k], v * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const body = new THREE.Mesh(geometry, latex.body);
  root.add(body);
  const shards = createShards(scene, latex.body);

  function reshape(cm) {
    profile(Math.max(0, cm), r, y, flat);
    for (let s = 0; s <= SEGMENTS; s++) {
      const phi = (s / SEGMENTS) * Math.PI * 2;
      const sin = Math.sin(phi);
      const cos = Math.cos(phi);
      for (let j = 0; j < POINTS; j++) {
        pos.setXYZ(s * POINTS + j, r[j] * sin * CM, y[j] * CM, r[j] * cos * flat[j] * CM);
      }
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
    // The lathe's first and last columns sit on the same seam; share their normals.
    const n = geometry.attributes.normal;
    for (let j = 0; j < POINTS; j++) {
      const a = j;
      const b = SEGMENTS * POINTS + j;
      const nx = n.getX(a) + n.getX(b);
      const ny = n.getY(a) + n.getY(b);
      const nz = n.getZ(a) + n.getZ(b);
      const len = Math.hypot(nx, ny, nz) || 1;
      n.setXYZ(a, nx / len, ny / len, nz / len);
      n.setXYZ(b, nx / len, ny / len, nz / len);
    }
    latex.setStretch(smooth(14, 46, cm));
  }

  // Shown size chases the true size on a soft spring, so the rubber overshoots and wobbles.
  let shownCm = 0;
  let velocity = 0;
  let targetCm = 0;

  return {
    // World-space points round the balloon's surface at a given size, at rest, for
    // framing the camera.
    outline(cm) {
      const pr = new Float32Array(POINTS);
      const py = new Float32Array(POINTS);
      const pf = new Float32Array(POINTS);
      profile(cm, pr, py, pf);
      const rest = new THREE.Matrix4().compose(
        mouth, new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2 + TILT, 0, 0)), new THREE.Vector3(1, 1, 1),
      );
      const points = [];
      for (let j = 0; j < POINTS; j += 3) {
        for (let a = 0; a < 12; a++) {
          const phi = (a / 12) * Math.PI * 2;
          points.push(new THREE.Vector3(pr[j] * Math.sin(phi), py[j], pr[j] * Math.cos(phi) * pf[j])
            .multiplyScalar(CM).applyMatrix4(rest));
        }
      }
      return points;
    },

    reset(cm) {
      shownCm = targetCm = cm;
      velocity = 0;
      body.visible = true;
      shards.clear();
      reshape(cm);
    },

    setDiameter(cm) { targetCm = cm; },

    pop() {
      body.visible = false;
      shards.burst(body, shownCm * CM);
    },

    update(dtS, tS) {
      const stiffness = 220;
      const damping = 11;
      velocity += ((targetCm - shownCm) * stiffness - velocity * damping) * dtS;
      shownCm += velocity * dtS;
      reshape(shownCm);

      // Small drift, like a balloon held in the lips; an empty one hangs down.
      const droop = 1 - smooth(0, 10, shownCm);
      root.rotation.z = Math.sin(tS * 0.9) * 0.025;
      root.rotation.x = -Math.PI / 2 + TILT - DROOP * droop + Math.sin(tS * 0.6) * 0.015;

      shards.update(dtS);
    },
  };
}
