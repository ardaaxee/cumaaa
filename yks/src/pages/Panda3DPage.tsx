import { useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '../components/Layout';
import { ProgressBar, toast } from '../components/ui';
import { update, useAppState } from '../store/store';
import { usePetNeeds } from '../hooks/usePetNeeds';
import { feedPet, waterPet } from '../utils/petCare';
import { petStatus } from '../utils/pet';
import { dashboard } from '../utils/stats';
import { dayKey } from '../utils/date';

type RoomId = 'living' | 'kitchen' | 'study' | 'bedroom' | 'balcony';

const ROOMS: { id: RoomId; icon: string; label: string; subtitle: string }[] = [
  { id: 'living', icon: '🛋️', label: 'Salon', subtitle: 'Dinlenme' },
  { id: 'kitchen', icon: '🍽️', label: 'Mutfak', subtitle: 'Yemek' },
  { id: 'study', icon: '📚', label: 'Çalışma', subtitle: 'Odak' },
  { id: 'bedroom', icon: '🛏️', label: 'Yatak', subtitle: 'Uyku' },
  { id: 'balcony', icon: '🌇', label: 'Balkon', subtitle: 'Mola' },
];

type SceneApi = {
  goToRoom: (room: RoomId, message?: string) => void;
  celebrate: () => void;
  petPanda: () => void;
  dispose: () => void;
};

const THREE_URL = 'https://esm.sh/three@0.180.0';

function roomEvent(progress: number): { room: RoomId; message: string } | null {
  if (progress >= 100) return { room: 'living', message: 'Günlük hedef tamamlandı! Evde kutlama zamanı 🎉' };
  if (progress >= 75) return { room: 'balcony', message: 'Hedefin %75’i tamam. Balkonda kısa bir nefes molası 🌇' };
  if (progress >= 50) return { room: 'study', message: 'Yarıladın! Panda da çalışma masasına geldi 📚' };
  if (progress >= 25) return { room: 'kitchen', message: 'İlk çeyrek tamam. Küçük bir enerji molası ☕' };
  return null;
}

export default function Panda3DPage() {
  const state = useAppState();
  const needs = usePetNeeds();
  const pet = useMemo(() => petStatus(state), [state]);
  const today = dayKey();
  const stats = useMemo(() => dashboard(state, today), [state, today]);
  const mountRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SceneApi | null>(null);
  const [room, setRoom] = useState<RoomId>('living');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sceneMessage, setSceneMessage] = useState('3D eve hoş geldin ♡');
  const [fullscreen, setFullscreen] = useState(false);

  const qProgress = state.profile.dailyQuestionGoal > 0 ? Math.min(1, stats.todayQuestions / state.profile.dailyQuestionGoal) : 1;
  const mProgress = state.profile.dailyStudyMinutes > 0 ? Math.min(1, stats.todayMinutes / state.profile.dailyStudyMinutes) : 1;
  const dailyProgress = Math.round(((qProgress + mProgress) / 2) * 100);

  useEffect(() => {
    const target = mountRef.current;
    if (!target) return;
    let cancelled = false;
    let cleanup = () => {};

    const boot = async () => {
      try {
        const THREE: any = await import(/* @vite-ignore */ THREE_URL);
        if (cancelled) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf6efff);
        scene.fog = new THREE.Fog(0xf6efff, 18, 34);

        const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 80);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
        renderer.domElement.className = 'panda3d-canvas';
        renderer.domElement.setAttribute('aria-label', '3D Panda evi. Sürükleyerek kamerayı döndür.');
        target.replaceChildren(renderer.domElement);

        const hemi = new THREE.HemisphereLight(0xfff7f2, 0x8ba0aa, 1.7);
        scene.add(hemi);

        const sun = new THREE.DirectionalLight(0xffedd2, 3.4);
        sun.position.set(8, 14, 7);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.camera.left = -18;
        sun.shadow.camera.right = 18;
        sun.shadow.camera.top = 18;
        sun.shadow.camera.bottom = -18;
        scene.add(sun);

        const warm = new THREE.PointLight(0xffb36b, 8, 11, 2);
        warm.position.set(-4, 3.8, 1);
        scene.add(warm);

        const mat = (color: number, roughness = 0.72, metalness = 0) =>
          new THREE.MeshStandardMaterial({ color, roughness, metalness });

        const box = (name: string, size: [number, number, number], pos: [number, number, number], color: number, parent = scene, cast = true) => {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat(color));
          mesh.name = name;
          mesh.position.set(...pos);
          mesh.castShadow = cast;
          mesh.receiveShadow = true;
          parent.add(mesh);
          return mesh;
        };

        const sphere = (size: [number, number, number], pos: [number, number, number], color: number, parent: any) => {
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), mat(color, 0.62));
          mesh.scale.set(...size);
          mesh.position.set(...pos);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          parent.add(mesh);
          return mesh;
        };

        // --- Evin kabuğu ---
        const floorMat = new THREE.MeshStandardMaterial({ color: 0xd7b894, roughness: 0.68 });
        const floor = new THREE.Mesh(new THREE.BoxGeometry(18, 0.35, 12), floorMat);
        floor.position.set(0, -0.2, 0);
        floor.receiveShadow = true;
        scene.add(floor);

        // sıcak meşe çizgileri
        for (let x = -8.5; x <= 8.5; x += 1.05) {
          box('floor-line', [0.025, 0.01, 11.7], [x, 0.005, 0], 0xb98e68, scene, false);
        }

        // arka ve yan duvarlar
        box('back-wall', [18, 5.6, 0.22], [0, 2.6, -5.9], 0xf7eee9);
        box('left-wall', [0.22, 5.6, 12], [-8.9, 2.6, 0], 0xf4ece8);
        box('right-wall', [0.22, 5.6, 12], [8.9, 2.6, 0], 0xf4ece8);

        // oda ayrımları
        box('divider-a', [0.14, 3.0, 4.3], [-2.1, 1.4, -3.7], 0xe9dfdc);
        box('divider-b', [0.14, 3.0, 4.2], [3.15, 1.4, -3.8], 0xe9dfdc);

        // halı
        const rug = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.45, 0.06, 48), mat(0xcdb9ea, 0.95));
        rug.position.set(-4.7, 0.03, 1.25);
        rug.receiveShadow = true;
        scene.add(rug);

        // --- Salon ---
        box('sofa-base', [4.1, 0.75, 1.45], [-5.0, 0.55, -0.9], 0xb5a6d8);
        box('sofa-back', [4.1, 1.25, 0.42], [-5.0, 1.3, -1.52], 0xa596cd);
        box('sofa-arm-l', [0.4, 0.92, 1.45], [-7.05, 0.75, -0.9], 0x9b8bc8);
        box('sofa-arm-r', [0.4, 0.92, 1.45], [-2.95, 0.75, -0.9], 0x9b8bc8);
        box('coffee-table', [2.0, 0.18, 1.05], [-4.65, 0.72, 1.2], 0x865f45);
        box('coffee-leg-a', [0.13, 0.7, 0.13], [-5.4, 0.35, 1.2], 0x684734);
        box('coffee-leg-b', [0.13, 0.7, 0.13], [-3.9, 0.35, 1.2], 0x684734);
        box('tv-wall', [2.7, 1.55, 0.14], [-5.0, 2.65, -5.72], 0x18171c);
        box('tv-console', [3.3, 0.5, 0.55], [-5.0, 0.55, -5.35], 0x6f5141);

        // --- Mutfak ---
        box('k-counter', [4.2, 1.0, 0.72], [5.9, 0.55, -5.22], 0xc7ae94);
        box('k-top', [4.3, 0.12, 0.9], [5.9, 1.1, -5.15], 0xf4f0eb);
        box('fridge', [1.2, 3.1, 1.0], [8.05, 1.55, -5.25], 0xdde3e6);
        box('k-table', [2.5, 0.15, 1.45], [5.5, 1.0, 0.4], 0x9c7659);
        for (const x of [4.55, 6.45]) {
          for (const z of [-0.05, 0.85]) box('table-leg', [0.12, 1.0, 0.12], [x, 0.5, z], 0x725039);
        }

        // --- Çalışma odası ---
        box('desk-top', [3.55, 0.16, 1.3], [0.35, 1.05, -4.7], 0x9b7452);
        box('desk-leg-l', [0.18, 1.05, 0.18], [-1.1, 0.53, -4.7], 0x6e4d37);
        box('desk-leg-r', [0.18, 1.05, 0.18], [1.8, 0.53, -4.7], 0x6e4d37);
        const screen = box('screen', [1.7, 1.05, 0.08], [0.35, 2.05, -5.15], 0x252631);
        const screenGlow = new THREE.PointLight(0x9a7cff, 3.2, 3.6, 2);
        screenGlow.position.set(0.35, 2.1, -4.6);
        scene.add(screenGlow);
        box('bookshelf', [1.15, 3.2, 0.55], [2.45, 1.6, -5.35], 0x9c785c);
        for (let y = 0.55; y < 3; y += 0.58) box('shelf', [1.0, 0.08, 0.45], [2.45, y, -5.0], 0x6e4b39);

        // --- Yatak odası ---
        box('bed-base', [3.2, 0.58, 2.55], [0.3, 0.42, 2.95], 0xcdaec3);
        box('mattress', [3.05, 0.32, 2.4], [0.3, 0.84, 2.95], 0xfffaf7);
        box('blanket', [3.0, 0.12, 1.42], [0.3, 1.05, 3.35], 0xbda7dc);
        box('headboard', [3.2, 1.4, 0.2], [0.3, 1.2, 4.18], 0xb18fa7);
        box('pillow-a', [1.0, 0.28, 0.65], [-0.55, 1.12, 2.25], 0xffffff);
        box('pillow-b', [1.0, 0.28, 0.65], [1.1, 1.12, 2.25], 0xffffff);

        // --- Balkon ---
        box('balcony-floor', [4.7, 0.18, 3.2], [6.35, 0.05, 3.8], 0xc9c6bd);
        for (let x = 4.2; x <= 8.5; x += 0.75) box('rail', [0.07, 1.2, 0.07], [x, 0.65, 5.25], 0x746d72);
        box('rail-top', [4.6, 0.08, 0.08], [6.35, 1.25, 5.25], 0x746d72);
        box('balcony-seat', [1.8, 0.55, 0.8], [6.35, 0.42, 3.9], 0x86a987);
        box('balcony-back', [1.8, 1.0, 0.22], [6.35, 1.0, 4.25], 0x769978);

        // bitkiler
        const makePlant = (x: number, z: number, scale = 1) => {
          const g = new THREE.Group();
          box('pot', [0.48 * scale, 0.52 * scale, 0.48 * scale], [0, 0.26 * scale, 0], 0xb97056, g);
          sphere([0.36 * scale, 0.62 * scale, 0.36 * scale], [0, 0.9 * scale, 0], 0x649a68, g);
          sphere([0.3 * scale, 0.48 * scale, 0.3 * scale], [-0.25 * scale, 0.92 * scale, 0], 0x76aa76, g);
          sphere([0.3 * scale, 0.48 * scale, 0.3 * scale], [0.25 * scale, 0.88 * scale, 0], 0x5e8e62, g);
          g.position.set(x, 0, z);
          scene.add(g);
        };
        makePlant(-7.8, 3.9, 1.15);
        makePlant(7.9, 4.15, 0.85);
        makePlant(4.35, 4.2, 0.7);

        // pencere + gökyüzü hissi
        const windowMat = new THREE.MeshPhysicalMaterial({
          color: 0xa8d9ff,
          transparent: true,
          opacity: 0.42,
          roughness: 0.08,
          transmission: 0.35,
        });
        const windowPane = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.5, 0.08), windowMat);
        windowPane.position.set(6.2, 3.0, -5.73);
        scene.add(windowPane);

        // --- Panda ---
        const panda = new THREE.Group();
        panda.name = 'panda';
        const body = sphere([0.72, 0.84, 0.62], [0, 0.95, 0], 0xf8f8f7, panda);
        const head = sphere([0.68, 0.62, 0.62], [0, 1.92, 0], 0xfafafa, panda);
        sphere([0.23, 0.24, 0.18], [-0.47, 2.38, -0.02], 0x18181b, panda);
        sphere([0.23, 0.24, 0.18], [0.47, 2.38, -0.02], 0x18181b, panda);
        sphere([0.21, 0.25, 0.10], [-0.27, 2.02, 0.54], 0x1d1d20, panda);
        sphere([0.21, 0.25, 0.10], [0.27, 2.02, 0.54], 0x1d1d20, panda);
        sphere([0.075, 0.075, 0.045], [-0.27, 2.03, 0.63], 0xffffff, panda);
        sphere([0.075, 0.075, 0.045], [0.27, 2.03, 0.63], 0xffffff, panda);
        sphere([0.11, 0.08, 0.07], [0, 1.83, 0.62], 0x111113, panda);
        sphere([0.22, 0.52, 0.20], [-0.66, 1.1, 0], 0x1b1b1e, panda).rotation.z = -0.2;
        sphere([0.22, 0.52, 0.20], [0.66, 1.1, 0], 0x1b1b1e, panda).rotation.z = 0.2;
        sphere([0.29, 0.36, 0.31], [-0.38, 0.24, 0.05], 0x1b1b1e, panda);
        sphere([0.29, 0.36, 0.31], [0.38, 0.24, 0.05], 0x1b1b1e, panda);
        panda.scale.setScalar(0.9);
        scene.add(panda);

        // --- Zeynep: sıcak, stilize low-poly karakter ---
        const zeynep = new THREE.Group();
        const skin = 0xf0c7ab;
        sphere([0.34, 0.40, 0.34], [0, 2.25, 0], skin, zeynep);
        const hair = sphere([0.38, 0.44, 0.36], [0, 2.34, -0.09], 0x32221f, zeynep);
        hair.scale.z = 0.78;
        box('torso', [0.76, 1.05, 0.48], [0, 1.36, 0], 0xb89bdc, zeynep);
        box('skirt', [0.88, 0.65, 0.56], [0, 0.68, 0], 0x75668e, zeynep);
        box('leg-l', [0.22, 0.72, 0.25], [-0.22, 0.04, 0], 0xead1c0, zeynep);
        box('leg-r', [0.22, 0.72, 0.25], [0.22, 0.04, 0], 0xead1c0, zeynep);
        sphere([0.11, 0.13, 0.05], [-0.14, 2.26, 0.32], 0x2a2020, zeynep);
        sphere([0.11, 0.13, 0.05], [0.14, 2.26, 0.32], 0x2a2020, zeynep);
        zeynep.scale.setScalar(0.86);
        scene.add(zeynep);

        const roomTargets: Record<RoomId, { focus: [number, number, number]; camera: [number, number, number]; panda: [number, number, number]; zeynep: [number, number, number] }> = {
          living: { focus: [-4.6, 1.1, 0.3], camera: [-0.5, 5.2, 9.2], panda: [-5.1, 0.15, 1.1], zeynep: [-3.6, 0.2, 0.6] },
          kitchen: { focus: [5.4, 1.2, -0.7], camera: [9.2, 5.2, 6.2], panda: [5.0, 0.15, 1.5], zeynep: [6.5, 0.2, 1.15] },
          study: { focus: [0.3, 1.5, -4.2], camera: [5.8, 5.0, 2.4], panda: [-0.35, 0.15, -3.5], zeynep: [1.0, 0.2, -3.65] },
          bedroom: { focus: [0.3, 1.2, 3.1], camera: [-4.3, 4.7, 8.7], panda: [-0.55, 0.15, 1.75], zeynep: [1.1, 0.2, 1.85] },
          balcony: { focus: [6.2, 1.0, 3.8], camera: [10.8, 4.4, 8.8], panda: [5.4, 0.15, 3.0], zeynep: [7.0, 0.2, 3.05] },
        };

        let desiredCamera = new THREE.Vector3(...roomTargets.living.camera);
        let desiredFocus = new THREE.Vector3(...roomTargets.living.focus);
        const focus = desiredFocus.clone();
        camera.position.copy(desiredCamera);
        camera.lookAt(focus);

        let yaw = Math.atan2(camera.position.x - focus.x, camera.position.z - focus.z);
        let pitch = 0.40;
        let distance = camera.position.distanceTo(focus);
        let roomOverride = true;
        let celebratingUntil = 0;
        let pettingUntil = 0;

        const moveCharacters = (id: RoomId) => {
          const t = roomTargets[id];
          panda.userData.from = panda.position.clone();
          panda.userData.to = new THREE.Vector3(...t.panda);
          panda.userData.moveStart = performance.now();
          panda.userData.moveEnd = performance.now() + 1150;
          zeynep.userData.from = zeynep.position.clone();
          zeynep.userData.to = new THREE.Vector3(...t.zeynep);
          zeynep.userData.moveStart = performance.now() + 180;
          zeynep.userData.moveEnd = performance.now() + 1380;
        };

        panda.position.set(...roomTargets.living.panda);
        zeynep.position.set(...roomTargets.living.zeynep);

        const setRoomCamera = (id: RoomId) => {
          const t = roomTargets[id];
          desiredCamera.set(...t.camera);
          desiredFocus.set(...t.focus);
          roomOverride = true;
          moveCharacters(id);
        };

        const sceneApi: SceneApi = {
          goToRoom: (id) => setRoomCamera(id),
          celebrate: () => {
            celebratingUntil = performance.now() + 4200;
          },
          petPanda: () => {
            pettingUntil = performance.now() + 1400;
          },
          dispose: () => {},
        };
        apiRef.current = sceneApi;

        // --- Mobil kamera kontrolleri ---
        const pointers = new Map<number, { x: number; y: number }>();
        let previousPinch = 0;
        const pointerDown = (e: PointerEvent) => {
          renderer.domElement.setPointerCapture?.(e.pointerId);
          pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
          roomOverride = false;
          if (pointers.size === 1) previousPinch = 0;
        };
        const pointerMove = (e: PointerEvent) => {
          const prev = pointers.get(e.pointerId);
          if (!prev) return;
          pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
          const values = [...pointers.values()];
          if (values.length === 1) {
            yaw -= (e.clientX - prev.x) * 0.007;
            pitch = Math.max(0.10, Math.min(1.15, pitch + (e.clientY - prev.y) * 0.005));
          } else if (values.length >= 2) {
            const dx = values[0].x - values[1].x;
            const dy = values[0].y - values[1].y;
            const pinch = Math.hypot(dx, dy);
            if (previousPinch) distance = Math.max(5.2, Math.min(16, distance - (pinch - previousPinch) * 0.018));
            previousPinch = pinch;
          }
        };
        const pointerUp = (e: PointerEvent) => {
          pointers.delete(e.pointerId);
          if (pointers.size < 2) previousPinch = 0;
        };
        const wheel = (e: WheelEvent) => {
          e.preventDefault();
          roomOverride = false;
          distance = Math.max(5.2, Math.min(16, distance + e.deltaY * 0.008));
        };
        renderer.domElement.addEventListener('pointerdown', pointerDown);
        renderer.domElement.addEventListener('pointermove', pointerMove);
        renderer.domElement.addEventListener('pointerup', pointerUp);
        renderer.domElement.addEventListener('pointercancel', pointerUp);
        renderer.domElement.addEventListener('wheel', wheel, { passive: false });

        const resize = () => {
          const rect = target.getBoundingClientRect();
          const width = Math.max(1, rect.width);
          const height = Math.max(1, rect.height);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        const ro = new ResizeObserver(resize);
        ro.observe(target);
        resize();

        const clock = new THREE.Clock();
        let raf = 0;
        const animate = () => {
          raf = requestAnimationFrame(animate);
          const now = performance.now();
          const t = clock.getElapsedTime();

          // karakter hareketleri
          for (const character of [panda, zeynep]) {
            const from = character.userData.from;
            const to = character.userData.to;
            const start = character.userData.moveStart;
            const end = character.userData.moveEnd;
            if (from && to && start && end && now < end) {
              const p = Math.max(0, Math.min(1, (now - start) / (end - start)));
              const eased = 1 - Math.pow(1 - p, 3);
              character.position.lerpVectors(from, to, eased);
              character.position.y += Math.abs(Math.sin(p * Math.PI * 6)) * 0.025;
            }
          }

          panda.rotation.y = Math.sin(t * 0.7) * 0.08;
          zeynep.rotation.y = -0.10 + Math.sin(t * 0.45) * 0.04;

          if (now < celebratingUntil) {
            panda.position.y = 0.15 + Math.abs(Math.sin(t * 5.5)) * 0.42;
            panda.rotation.y += t * 0.7;
            zeynep.position.y = 0.2 + Math.abs(Math.sin(t * 3.8)) * 0.12;
          } else if (now < pettingUntil) {
            panda.scale.setScalar(0.9 + Math.sin(t * 10) * 0.035);
            head.rotation.z = Math.sin(t * 7) * 0.08;
          } else {
            panda.scale.setScalar(0.9);
            panda.position.y += Math.sin(t * 2.2) * 0.012;
            head.rotation.z *= 0.86;
          }

          // kamera yumuşak geçiş
          if (roomOverride) {
            camera.position.lerp(desiredCamera, 0.055);
            focus.lerp(desiredFocus, 0.06);
            distance = camera.position.distanceTo(focus);
            yaw = Math.atan2(camera.position.x - focus.x, camera.position.z - focus.z);
            pitch = Math.asin((camera.position.y - focus.y) / Math.max(0.01, distance));
          } else {
            focus.lerp(desiredFocus, 0.04);
            const cp = Math.cos(pitch);
            const targetPos = new THREE.Vector3(
              focus.x + Math.sin(yaw) * cp * distance,
              focus.y + Math.sin(pitch) * distance,
              focus.z + Math.cos(yaw) * cp * distance,
            );
            camera.position.lerp(targetPos, 0.14);
          }
          camera.lookAt(focus);

          // gün / gece rengi
          const hour = new Date().getHours();
          const night = hour >= 20 || hour < 7;
          const desiredBg = new THREE.Color(night ? 0x15182a : 0xf6efff);
          scene.background.lerp(desiredBg, 0.02);
          scene.fog.color.lerp(desiredBg, 0.02);
          hemi.intensity += ((night ? 0.62 : 1.7) - hemi.intensity) * 0.025;
          sun.intensity += ((night ? 0.7 : 3.4) - sun.intensity) * 0.025;
          warm.intensity += ((night ? 10 : 5) - warm.intensity) * 0.025;
          screen.material.emissive = new THREE.Color(night ? 0x6650aa : 0x201d31);
          screen.material.emissiveIntensity = night ? 0.8 : 0.18;

          renderer.render(scene, camera);
        };
        animate();

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          renderer.domElement.removeEventListener('pointerdown', pointerDown);
          renderer.domElement.removeEventListener('pointermove', pointerMove);
          renderer.domElement.removeEventListener('pointerup', pointerUp);
          renderer.domElement.removeEventListener('pointercancel', pointerUp);
          renderer.domElement.removeEventListener('wheel', wheel);
          scene.traverse((obj: any) => {
            obj.geometry?.dispose?.();
            const material = obj.material;
            if (Array.isArray(material)) material.forEach((m: any) => m.dispose?.());
            else material?.dispose?.();
          });
          renderer.dispose();
          apiRef.current = null;
        };

        setLoading(false);
      } catch (error) {
        console.error('[panda3d]', error);
        setLoadError('3D motoru yüklenemedi. İnternet bağlantısını kontrol edip tekrar aç.');
        setLoading(false);
      }
    };

    void boot();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  // Çalışma ilerlemesi 3D sahneyi de canlı değiştirir.
  useEffect(() => {
    const event = roomEvent(dailyProgress);
    if (!event || !apiRef.current) return;
    const key = `iyiki-panda3d-progress-${today}-${dailyProgress >= 100 ? 100 : dailyProgress >= 75 ? 75 : dailyProgress >= 50 ? 50 : 25}`;
    try {
      if (localStorage.getItem(key) === '1') return;
      localStorage.setItem(key, '1');
    } catch { /* olay yine gösterilir */ }
    setRoom(event.room);
    setSceneMessage(event.message);
    apiRef.current.goToRoom(event.room, event.message);
    if (dailyProgress >= 100) apiRef.current.celebrate();
  }, [dailyProgress, today]);

  const go = (id: RoomId) => {
    setRoom(id);
    const info = ROOMS.find((r) => r.id === id)!;
    setSceneMessage(`${info.icon} ${info.label} · ${info.subtitle}`);
    apiRef.current?.goToRoom(id);
  };

  const feed = () => {
    if (needs.bamboo < 1) return toast('Bambu yok. 5 doğru cevapla 1 bambu kazanabilirsin.');
    if (needs.food >= 99) return toast('Panda zaten tok ♡');
    update((s) => feedPet(s));
    setSceneMessage('Panda bambusunu afiyetle yiyor 🎋');
    go('kitchen');
    apiRef.current?.petPanda();
  };

  const water = () => {
    if (needs.drops < 1) return toast('Su damlası yok. Soru çözerek kazanabilirsin.');
    if (needs.water >= 99) return toast('Panda şu an susamıyor ♡');
    update((s) => waterPet(s));
    setSceneMessage('Panda suyunu içti 💧');
    go('kitchen');
  };

  const petPanda = () => {
    setSceneMessage('Panda seni görünce mutlu oldu 🐼♡');
    apiRef.current?.petPanda();
    try { navigator.vibrate?.(35); } catch { /* noop */ }
  };

  const toggleFullscreen = async () => {
    const el = mountRef.current?.closest('.panda3d-stage') as HTMLElement | null;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch {
      toast('Tam ekran bu tarayıcıda kullanılamıyor.');
    }
  };

  return (
    <div className="panda3d-page">
      <PageHeader
        title="Panda Evi 3D"
        sub="Yaşayan 3D çalışma evi · dokun, döndür, yaklaş"
        actions={<a className="btn small ghost" href="#/pandam-klasik">2D klasik</a>}
      />

      <section className="panda3d-stage">
        <div className="panda3d-viewport" ref={mountRef}>
          {loading && (
            <div className="panda3d-loading">
              <div className="panda3d-loader-orb">🐼</div>
              <b>3D ev hazırlanıyor…</b>
              <span>Odalar, ışıklar ve karakterler kuruluyor.</span>
            </div>
          )}
          {loadError && (
            <div className="panda3d-loading error">
              <b>3D sahne açılamadı</b>
              <span>{loadError}</span>
              <a className="btn small" href="#/pandam-klasik">Klasik evi aç</a>
            </div>
          )}
        </div>

        <div className="panda3d-top-hud">
          <div className="panda3d-status">
            <span className="panda3d-live-dot" />
            <div>
              <b>{state.settings.pet.name} · Sv. {pet.level}</b>
              <small>{sceneMessage}</small>
            </div>
          </div>
          <button className="panda3d-icon-btn" type="button" onClick={() => void toggleFullscreen()} aria-label="Tam ekran">
            {fullscreen ? '↙' : '⛶'}
          </button>
        </div>

        <div className="panda3d-roombar" role="navigation" aria-label="3D ev odaları">
          {ROOMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={room === item.id ? 'active' : ''}
              onClick={() => go(item.id)}
              aria-pressed={room === item.id}
            >
              <span>{item.icon}</span>
              <b>{item.label}</b>
            </button>
          ))}
        </div>

        <div className="panda3d-controls-hint">
          <span>☝️ sürükle: kamerayı döndür</span>
          <span>🤏 iki parmak: yakınlaş</span>
        </div>
      </section>

      <section className="panda3d-dashboard section">
        <div className="card panda3d-needs">
          <div className="row between nowrap">
            <div>
              <div className="eyebrow">Panda durumu</div>
              <h2>{state.settings.pet.name} bugün nasıl?</h2>
            </div>
            <span className="badge brand">{pet.mood === 'coskulu' ? '🎉 Coşkulu' : pet.mood === 'mutlu' ? '♡ Mutlu' : '🌙 Uykulu'}</span>
          </div>

          <div className="panda3d-meter">
            <div className="row between nowrap"><span>🎋 Tokluk</span><b>%{Math.round(needs.food)}</b></div>
            <ProgressBar value={needs.food} label="Panda tokluk" />
          </div>
          <div className="panda3d-meter">
            <div className="row between nowrap"><span>💧 Su</span><b>%{Math.round(needs.water)}</b></div>
            <ProgressBar value={needs.water} label="Panda su" />
          </div>

          <div className="panda3d-action-grid">
            <button type="button" className="btn primary" onClick={feed}>🎋 Besle <small>{needs.bamboo}</small></button>
            <button type="button" className="btn" onClick={water}>💧 Su ver <small>{needs.drops}</small></button>
            <button type="button" className="btn" onClick={petPanda}>♡ Sev</button>
            <button type="button" className="btn" onClick={() => { go('study'); setSceneMessage('Panda seninle çalışma masasına geldi 📚'); }}>📚 Birlikte çalış</button>
          </div>
        </div>

        <div className="card panda3d-progress-card">
          <div className="eyebrow">Ev bugün seninle yaşıyor</div>
          <div className="panda3d-progress-number">%{dailyProgress}</div>
          <h2>Günlük çalışma ilerlemesi</h2>
          <ProgressBar value={dailyProgress} label="Günlük çalışma ilerlemesi" />
          <div className="panda3d-milestones">
            <div className={dailyProgress >= 25 ? 'done' : ''}><span>25</span><small>☕ Mutfak molası</small></div>
            <div className={dailyProgress >= 50 ? 'done' : ''}><span>50</span><small>📚 Birlikte çalışma</small></div>
            <div className={dailyProgress >= 75 ? 'done' : ''}><span>75</span><small>🌇 Balkon molası</small></div>
            <div className={dailyProgress >= 100 ? 'done' : ''}><span>100</span><small>🎉 Kutlama</small></div>
          </div>
          <p className="tiny muted">
            {stats.todayQuestions} soru · {stats.todayMinutes} dk çalışma · bugün {pet.todayXp} XP
          </p>
        </div>
      </section>
    </div>
  );
}
