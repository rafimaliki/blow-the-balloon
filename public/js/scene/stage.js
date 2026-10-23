// Renderer, first-person camera at the player's eyes, and a soft room for reflections.
// World units are metres; the origin is between the eyes.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Where the balloon's neck meets the lips, relative to the eyes.
export const MOUTH = new THREE.Vector3(0, -0.075, -0.05);

// The room behind the balloon, painted already out of focus: the eyes are on the balloon.
// ponytail: a painted backdrop, not geometry; build a real room if the camera ever moves.
function roomBackdrop() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d');
  const wall = g.createLinearGradient(0, 0, 0, 170);
  wall.addColorStop(0, '#cbb9a6');
  wall.addColorStop(1, '#a8927d');
  g.fillStyle = wall;
  g.fillRect(0, 0, 256, 256);
  const floor = g.createLinearGradient(0, 160, 0, 256);
  floor.addColorStop(0, '#7a5a42');
  floor.addColorStop(1, '#4e3727');
  g.fillStyle = floor;
  g.fillRect(0, 165, 256, 91);
  // Daylight from a window to the left.
  const sun = g.createRadialGradient(40, 70, 4, 40, 70, 110);
  sun.addColorStop(0, 'rgb(255 246 228 / 0.95)');
  sun.addColorStop(1, 'rgb(255 246 228 / 0)');
  g.fillStyle = sun;
  g.fillRect(0, 0, 256, 256);
  // Soften it by redrawing through a blur filter (slightly oversized to hide the blurred edges).
  const blurred = document.createElement('canvas');
  blurred.width = blurred.height = 256;
  const b = blurred.getContext('2d');
  b.filter = 'blur(22px)';
  b.drawImage(c, -40, -40, 336, 336);
  const tex = new THREE.CanvasTexture(blurred);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const env = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.9;
  scene.background = roomBackdrop();

  // A warm key light from above-front gives the latex its highlight; the room fills the rest.
  const key = new THREE.DirectionalLight(0xfff1e0, 2.2);
  key.position.set(0.6, 1.2, 0.4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfd8ff, 0.8);
  rim.position.set(-0.8, 0.3, -1);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 50);
  camera.rotation.x = -0.14; // looking slightly down, along the balloon
  const rest = camera.position.clone();

  const resize = () => {
    const w = innerWidth;
    const h = innerHeight;
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
