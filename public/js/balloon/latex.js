// Soft, matte toy-rubber look. The rubber lightens and gets a little glossier as it
// stretches, and stays darker where it is thick near the neck; both are cues, not meters.

import * as THREE from 'three';

const THICK = new THREE.Color('#d9493a');
const THIN = new THREE.Color('#f58c76');

export function createLatex() {
  const body = new THREE.MeshPhysicalMaterial({
    color: THICK.clone(),
    roughness: 0.55,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    vertexColors: true,
    side: THREE.DoubleSide,
  });

  const neck = new THREE.MeshPhysicalMaterial({
    color: '#b8392d',
    roughness: 0.6,
    clearcoat: 0.2,
    clearcoatRoughness: 0.5,
  });

  return {
    body,
    neck,

    // Darkens vertices near the neck (low y on the unit lathe) where the rubber stays thick.
    shadeThickness(geometry) {
      const pos = geometry.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        const k = 0.78 + 0.22 * Math.min(1, pos.getY(i) / 0.28);
        colors.set([k, k, k], i * 3);
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    },

    // 0 = fresh rubber, 1 = stretched thin.
    setStretch(s) {
      body.color.copy(THICK).lerp(THIN, s);
      body.roughness = 0.55 - 0.2 * s;
    },
  };
}
