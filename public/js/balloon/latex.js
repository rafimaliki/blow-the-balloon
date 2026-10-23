// Latex look. Real balloons get lighter and glossier as the rubber thins, and stay
// darker where the rubber is thick near the neck; both are cues, not meters.

import * as THREE from 'three';

const THICK = new THREE.Color('#9e0f19');
const THIN = new THREE.Color('#ff4b57');

export function createLatex() {
  const body = new THREE.MeshPhysicalMaterial({
    color: THICK.clone(),
    roughness: 0.38,
    clearcoat: 0.6,
    clearcoatRoughness: 0.18,
    sheen: 0.15,
    sheenColor: new THREE.Color('#ff9aa0'),
    sheenRoughness: 0.5,
    vertexColors: true,
    side: THREE.DoubleSide,
  });

  const neck = new THREE.MeshPhysicalMaterial({
    color: '#7d0a12',
    roughness: 0.45,
    clearcoat: 0.6,
    clearcoatRoughness: 0.3,
  });

  return {
    body,
    neck,

    // Darkens vertices near the neck (low v on the lathe) where the rubber stays thick.
    shadeThickness(geometry) {
      const pos = geometry.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const k = 0.55 + 0.45 * Math.min(1, y / 0.28);
        colors.set([k, k, k], i * 3);
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    },

    // 0 = fresh rubber, 1 = stretched thin.
    setStretch(s) {
      body.color.copy(THICK).lerp(THIN, s);
      body.roughness = 0.38 - 0.2 * s;
    },
  };
}
