// Renderer, first-person camera at the player's eyes, and soft studio light.
// World units are metres; the origin is between the eyes. The page background shows
// through the transparent canvas, so the scene has no backdrop of its own.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Where the balloon's neck meets the lips, relative to the eyes.
export const MOUTH = new THREE.Vector3(0, -0.095, -0.05);

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  // Neutral keeps the toy-like colours as picked instead of filmic-desaturating them.
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  // A faint room reflection keeps a soft sheen without looking photographic.
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  scene.add(new THREE.HemisphereLight(0xfffaf0, 0xc9d3bd, 1.4));
  const key = new THREE.DirectionalLight(0xfff4e4, 1.8);
  key.position.set(-0.6, 1.0, 0.5);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 50);
  camera.rotation.x = -0.4; // looking down at the balloon so all of it, neck included, is in frame
  const rest = camera.position.clone();

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Portrait phones are narrow: widen the vertical field so the balloon still fits across.
    camera.fov = w < h ? 72 : 60;
    camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize);
  resize();

  let shake = 0;
  return {
    scene,
    camera,
    render() { renderer.render(scene, camera); },
    shake(amount) { shake = Math.max(shake, amount); },
    update(dtS, tS) {
      // Breathing sway plus any shake from a pop, decaying quickly.
      shake *= Math.exp(-dtS * 9);
      camera.position.set(
        rest.x + Math.sin(tS * 0.7) * 0.002 + (Math.random() - 0.5) * shake,
        rest.y + Math.sin(tS * 1.1) * 0.0015 + (Math.random() - 0.5) * shake,
        rest.z,
      );
    },
  };
}
