// The toy-like outdoors around the player: grass underfoot, rolling hills, lollipop trees
// and slow puffy clouds. Built from plain shapes so it stays cheap on phones.

import * as THREE from 'three';

const EYE_HEIGHT = 1.6;      // metres from the grass to the player's eyes
const SKY = 0xdcedf9;        // matches the horizon end of the page's sky gradient

// Small seeded random so the scenery is the same on every visit.
function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const matte = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.95 });

// Grass tufts and flowers across the near field, one instanced draw call each.
function scatter(scene, rand, ground) {
  const place = (geo, count, colors, height) => {
    const mesh = new THREE.InstancedMesh(geo, matte('#ffffff'), count);
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = 3 + Math.pow(rand(), 0.7) * 35;
      const s = 0.7 + rand() * 0.8;
      m.makeScale(s, s, s).setPosition(Math.sin(angle) * dist, ground + height * s, -Math.cos(angle) * dist);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(colors[Math.floor(rand() * colors.length)]));
    }
    scene.add(mesh);
  };
  place(new THREE.ConeGeometry(0.07, 0.15, 5), 900, ['#7fbf68', '#8fca74', '#6eb15d'], 0.075);
  place(new THREE.SphereGeometry(0.045, 8, 6), 260, ['#ffffff', '#ffe066', '#ffb3c7', '#ffffff'], 0.06);
}

export function createWorld(scene) {
  const rand = seeded(7);
  const ground = -EYE_HEIGHT;
  scene.fog = new THREE.Fog(SKY, 18, 140);

  const grass = new THREE.Mesh(new THREE.CircleGeometry(200, 48), matte('#a6d38c'));
  grass.rotation.x = -Math.PI / 2;
  grass.position.y = ground;
  scene.add(grass);

  // Hills: big squashed spheres sunk into the ground, darker the closer they are.
  const hillGeo = new THREE.SphereGeometry(1, 32, 16);
  const hillTones = ['#8cc477', '#97cc80', '#a9d88f', '#b7dfa0'];
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2 + rand() * 0.5;
    const dist = 45 + rand() * 50;
    const hill = new THREE.Mesh(hillGeo, matte(hillTones[i % hillTones.length]));
    hill.scale.set(18 + rand() * 20, 5 + rand() * 7, 18 + rand() * 20);
    hill.position.set(Math.sin(angle) * dist, ground - 1, -Math.cos(angle) * dist);
    scene.add(hill);
  }

  // Lollipop trees: a trunk and a round crown, scattered in front and to the sides.
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.16, 1, 8);
  const crownGeo = new THREE.SphereGeometry(1, 20, 14);
  const trunkMat = matte('#a77b58');
  const crownMats = ['#6fb36a', '#7cc074', '#5fa564'].map(matte);
  for (let i = 0; i < 16; i++) {
    const angle = (rand() - 0.5) * Math.PI * 1.6; // mostly ahead, some to the sides
    const dist = 14 + rand() * 30;
    if (Math.abs(angle) < 0.3 && dist < 25) continue; // keep the view behind the balloon open
    const size = 0.8 + rand() * 0.9;
    const x = Math.sin(angle) * dist;
    const z = -Math.cos(angle) * dist;

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.scale.set(size, 1.6 * size, size);
    trunk.position.set(x, ground + 0.8 * size, z);
    const crown = new THREE.Mesh(crownGeo, crownMats[i % crownMats.length]);
    crown.scale.setScalar(1.1 * size);
    crown.position.set(x, ground + 2.2 * size, z);
    scene.add(trunk, crown);
  }

  scatter(scene, rand, ground);

  // Clouds: clusters of flattened white puffs that drift slowly sideways.
  const puffGeo = new THREE.SphereGeometry(1, 20, 12);
  const cloudMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.25 });
  const clouds = [];
  for (let i = 0; i < 7; i++) {
    const cloud = new THREE.Group();
    const puffs = 3 + Math.floor(rand() * 3);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      const r = 2.2 + rand() * 1.8;
      puff.scale.set(r * 1.3, r * 0.8, r);
      puff.position.set((p - puffs / 2) * 2.6, rand() * 1.2, rand() * 1.5);
      cloud.add(puff);
    }
    cloud.position.set(-70 + rand() * 140, 14 + rand() * 14, -50 - rand() * 50);
    scene.add(cloud);
    clouds.push({ cloud, speed: 0.4 + rand() * 0.6 });
  }

  return {
    update(dtS) {
      for (const c of clouds) {
        c.cloud.position.x += c.speed * dtS;
        if (c.cloud.position.x > 80) c.cloud.position.x = -80; // wrap round the sky
      }
    },
  };
}
