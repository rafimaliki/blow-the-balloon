// Renderer, camera, light and backdrop. World units are metres; the origin is the
// player's eyes. The camera looks at the balloon from behind and above, so it points away
// from the viewer, and sits just far enough back that the largest balloon fits the screen.
// The backdrop is a real outdoor panorama, blurred as if the lens were focused on the
// balloon; it also lights the balloon. Until it loads, the page's sky gradient shows.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// "Meadow 2" by Sergej Majboroda, Poly Haven, CC0.
const BACKDROP_URL = 'assets/meadow_2_1k.hdr';

const PITCH = 0.5;   // radians the camera looks down at the balloon
const YAW = 0.2;     // a touch to the side, so the balloon points away without hiding its shape
// Screen area (normalised -1..1) the largest balloon must stay inside; the top leaves
// room for the title bar.
const SAFE = { left: -0.9, right: 0.9, bottom: -0.88, top: 0.78 };

// Where the balloon's neck meets the lips, relative to the eyes.
export const MOUTH = new THREE.Vector3(0, -0.095, -0.05);

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  // Neutral keeps the toy-like colours as picked instead of filmic-desaturating them.
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  // A neutral studio stands in until the meadow arrives, and stays if it never does.
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;
  new RGBELoader().load(BACKDROP_URL, (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = hdr;
    scene.backgroundBlurriness = 0.15;
    scene.backgroundIntensity = 1.35;
    // The camera looks down at the balloon; tip the panorama so the sky and horizon still
    // sit behind it instead of a wall of dark grass.
    scene.backgroundRotation.x = -(PITCH + 0.15);
    scene.environment = pmrem.fromEquirectangular(hdr).texture;
    scene.environmentIntensity = 0.9;
  });

  // The panorama's own sun gives the one real highlight; this only lifts the shadows.
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9d6ee, 0.6));

  const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 300);
  const back = new THREE.Vector3( // from the balloon towards the camera
    Math.sin(YAW) * Math.cos(PITCH),
    Math.sin(PITCH),
    Math.cos(YAW) * Math.cos(PITCH),
  );
  const rest = new THREE.Vector3();
  const center = new THREE.Vector3();
  const projected = new THREE.Vector3();
  let outline = [];

  const place = (distance) => {
    rest.copy(center).addScaledVector(back, distance);
    camera.position.copy(rest);
    camera.lookAt(center);
    camera.updateMatrixWorld();
  };
  const fits = () => outline.every((p) => {
    projected.copy(p).project(camera);
    return projected.z < 1 && projected.x >= SAFE.left && projected.x <= SAFE.right
      && projected.y >= SAFE.bottom && projected.y <= SAFE.top;
  });

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 72 : 60;
    camera.updateProjectionMatrix();
    // Closest camera distance at which the whole outline is inside the safe area.
    let near = 0.05;
    let far = 10;
    for (let i = 0; i < 24; i++) {
      const mid = (near + far) / 2;
      place(mid);
      if (fits()) far = mid; else near = mid;
    }
    place(far);
  };
  addEventListener('resize', resize);

  let shake = 0;
  return {
    scene,
    camera,
    render() { renderer.render(scene, camera); },
    // Frames the view around the biggest balloon, given as world-space outline points.
    frame(points) {
      outline = points;
      new THREE.Box3().setFromPoints(points).getCenter(center);
      resize();
    },
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
