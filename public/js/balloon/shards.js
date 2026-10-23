// Torn rubber flying off when the balloon pops.

import * as THREE from 'three';

const COUNT = 48;
const LIFE_S = 1.1;
const GRAVITY = -6;

export function createShards(scene, material) {
  const geo = new THREE.PlaneGeometry(1, 0.7, 2, 1);
  // Bend each piece a little so it reads as curved rubber, not paper.
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, -0.25 * p.getX(i) * p.getX(i));
  geo.computeVertexNormals();

  const mat = material.clone();
  mat.transparent = true;
  mat.vertexColors = false; // the plane has no colour attribute; it would render black
  const pieces = [];
  const tmp = new THREE.Vector3();

  return {
    clear() {
      for (const s of pieces) scene.remove(s.mesh);
      pieces.length = 0;
    },

    // Scatters pieces outward from random points on the surface of the `body` mesh.
    burst(body, widthM) {
      this.clear();
      body.updateWorldMatrix(true, false);
      const pos = body.geometry.attributes.position;
      body.geometry.computeBoundingSphere();
      const centre = body.geometry.boundingSphere.center.clone().applyMatrix4(body.matrixWorld);
      mat.opacity = 1;
      mat.color.copy(material.color);

      for (let i = 0; i < COUNT; i++) {
        tmp.fromBufferAttribute(pos, Math.floor(Math.random() * pos.count)).applyMatrix4(body.matrixWorld);

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(tmp);
        mesh.scale.setScalar(widthM * (0.12 + Math.random() * 0.18));
        mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        scene.add(mesh);

        const out = tmp.clone().sub(centre).normalize();
        pieces.push({
          mesh,
          velocity: out.multiplyScalar(1.5 + Math.random() * 3.5),
          spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(30),
          age: 0,
        });
      }
    },

    update(dtS) {
      for (const s of pieces) {
        s.age += dtS;
        s.velocity.y += GRAVITY * dtS;
        s.velocity.multiplyScalar(Math.exp(-dtS * 2.5)); // air drag on a light scrap
        s.mesh.position.addScaledVector(s.velocity, dtS);
        s.mesh.rotation.x += s.spin.x * dtS;
        s.mesh.rotation.y += s.spin.y * dtS;
        s.mesh.rotation.z += s.spin.z * dtS;
      }
      if (pieces.length) {
        mat.opacity = Math.max(0, 1 - pieces[0].age / LIFE_S);
        if (mat.opacity === 0) this.clear();
      }
    },
  };
}
