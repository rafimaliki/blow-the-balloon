// Latex look: a satin rubber body under a crisp thin sheen. The rubber lightens and gets a
// little glossier as it stretches, and stays darker where it is thick at the neck; both
// are cues, not meters.

import * as THREE from 'three';

const THICK = new THREE.Color('#c81e1e');
const THIN = new THREE.Color('#ff4a3d');

export function createLatex() {
  const body = new THREE.MeshPhysicalMaterial({
    color: THICK.clone(),
    roughness: 0.5,
    clearcoat: 0.7,
    clearcoatRoughness: 0.12,
    vertexColors: true,
    side: THREE.DoubleSide,
  });

  return {
    body,

    // 0 = fresh rubber, 1 = stretched thin.
    setStretch(s) {
      body.color.copy(THICK).lerp(THIN, s);
      body.roughness = 0.55 - 0.2 * s;
    },
  };
}
