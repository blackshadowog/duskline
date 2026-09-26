import { useEffect, useRef } from "react";
import * as THREE from "three";

const LOCATIONS: Array<[number, number]> = [
  [-1.95, 0.45],
  [-0.95, -0.6],
  [0.05, 0.55],
  [1.05, -0.5],
  [2, 0.25],
];

export default function StoryIntel3D({ chapter, accent }: { chapter: number; accent: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(0, 5.5, 8.4);
    camera.lookAt(0, 0.12, 0);
    scene.add(new THREE.AmbientLight(0x96b9c5, 1.3));
    const key = new THREE.PointLight(new THREE.Color(accent), 35, 12);
    key.position.set(1.4, 3.2, 1.5);
    scene.add(key);

    const accentColor = new THREE.Color(accent);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x122329, metalness: 0.58, roughness: 0.45 });
    const edgeMaterial = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.58 });
    const activeMaterial = new THREE.MeshBasicMaterial({ color: accentColor });
    const quietMaterial = new THREE.MeshBasicMaterial({ color: 0x55747a, transparent: true, opacity: 0.62 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.95, 0.22, 8), baseMaterial);
    base.rotation.y = Math.PI / 8;
    base.position.y = -0.35;
    scene.add(base);

    const terrainGeometry = new THREE.PlaneGeometry(5.75, 3.3, 30, 20);
    terrainGeometry.rotateX(-Math.PI / 2);
    const vertices = terrainGeometry.attributes.position;
    for (let i = 0; i < vertices.count; i += 1) {
      const x = vertices.getX(i);
      const z = vertices.getZ(i);
      const relief = Math.sin(x * 2.3) * Math.cos(z * 3.4) * 0.065 + Math.cos(x * 5 - z * 2) * 0.025;
      vertices.setY(i, relief);
    }
    terrainGeometry.computeVertexNormals();
    const terrain = new THREE.Mesh(
      terrainGeometry,
      new THREE.MeshStandardMaterial({ color: 0x163238, metalness: 0.34, roughness: 0.72, flatShading: true, side: THREE.DoubleSide }),
    );
    terrain.position.y = -0.18;
    scene.add(terrain);

    const grid = new THREE.GridHelper(5.7, 20, 0x406672, 0x28464e);
    grid.position.y = -0.073;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.48;
    scene.add(grid);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.012, 4, 100), edgeMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.08;
    scene.add(rim);

    const pulses: THREE.Mesh[] = [];
    const animatedLandmarks: THREE.Object3D[] = [];
    const pineGreen = new THREE.MeshStandardMaterial({ color: 0x4c7963, roughness: 0.85 });
    const sand = new THREE.MeshStandardMaterial({ color: 0xc5a577, roughness: 0.9 });
    const snow = new THREE.MeshStandardMaterial({ color: 0xcadfe3, metalness: 0.15, roughness: 0.65 });
    const city = new THREE.MeshStandardMaterial({ color: 0x3d526c, metalness: 0.5, roughness: 0.3 });
    const cargo = new THREE.MeshStandardMaterial({ color: 0x9e6059, metalness: 0.35, roughness: 0.58 });

    for (let i = 0; i < LOCATIONS.length; i += 1) {
      const [x, z] = LOCATIONS[i];
      const isActive = chapter === 0 ? i === 0 : chapter === 6 ? i === 4 : i === chapter - 1;
      const towerHeight = isActive ? 1.05 : 0.38;
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.12, towerHeight, 8), isActive ? activeMaterial : quietMaterial);
      tower.position.set(x, towerHeight / 2, z);
      scene.add(tower);

      const foot = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.15, 32), isActive ? activeMaterial : quietMaterial);
      foot.rotation.x = -Math.PI / 2;
      foot.position.set(x, 0.018, z);
      scene.add(foot);

      if (isActive) {
        const halo = new THREE.Mesh(
          new THREE.RingGeometry(0.22, 0.25, 48),
          new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }),
        );
        halo.rotation.x = -Math.PI / 2;
        halo.position.set(x, 0.045, z);
        scene.add(halo);
        pulses.push(halo);

        const beacon = new THREE.PointLight(accentColor, 3.5, 2.8);
        beacon.position.set(x, 1.25, z);
        scene.add(beacon);
      }

      // Each stop on the route is a tiny animated 3D diorama, not just a map pin.
      const landmark = new THREE.Group();
      landmark.position.set(x, 0.08, z - 0.16);
      if (i === 0) {
        for (const dx of [-0.18, 0.13]) {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.23, 5), baseMaterial);
          trunk.position.set(dx, 0.14, -0.08);
          const needles = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.33, 6), pineGreen);
          needles.position.set(dx, 0.36, -0.08);
          landmark.add(trunk, needles);
        }
      } else if (i === 1) {
        const house = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.25), sand);
        house.position.set(-0.1, 0.12, -0.03);
        const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.48, 8), sand);
        turret.position.set(0.19, 0.24, 0.04);
        landmark.add(house, turret);
      } else if (i === 2) {
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), snow);
        dome.position.set(-0.04, 0.08, 0);
        const dish = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 6, 0, Math.PI * 2, 0, Math.PI / 3), snow);
        dish.position.set(0.15, 0.34, -0.03);
        landmark.add(dome, dish);
        animatedLandmarks.push(dish);
      } else if (i === 3) {
        for (const [dx, h] of [[-0.2, 0.42], [0.05, 0.55], [0.25, 0.32]]) {
          const block = new THREE.Mesh(new THREE.BoxGeometry(0.15, h, 0.18), city);
          block.position.set(dx, h / 2, 0);
          landmark.add(block);
        }
      } else {
        for (const [dx, dz] of [[-0.2, -0.1], [0.12, 0.06], [0.19, -0.15]]) {
          const container = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.13, 0.15), cargo);
          container.position.set(dx, 0.065, dz);
          landmark.add(container);
        }
        const mast = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.51, 0.02), snow);
        mast.position.set(-0.28, 0.26, 0);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.025, 0.025), snow);
        arm.position.set(-0.12, 0.49, 0);
        landmark.add(mast, arm);
      }
      scene.add(landmark);
    }

    const route = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(LOCATIONS.map(([x, z]) => new THREE.Vector3(x, 0.045, z))),
      new THREE.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.85, depthWrite: false }),
    );
    scene.add(route);
    const traveler = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), activeMaterial);
    scene.add(traveler);

    const sweepShape = new THREE.Shape();
    sweepShape.moveTo(0, 0);
    sweepShape.lineTo(3.1, -0.3);
    sweepShape.lineTo(3.1, 0.3);
    sweepShape.closePath();
    const sweep = new THREE.Mesh(
      new THREE.ShapeGeometry(sweepShape),
      new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false }),
    );
    sweep.rotation.x = -Math.PI / 2;
    sweep.position.y = 0.06;
    scene.add(sweep);

    const dustPositions = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i += 1) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 7;
      dustPositions[i * 3 + 1] = 0.1 + Math.random() * 2.8;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({ color: accentColor, size: 0.026, transparent: true, opacity: 0.52 }),
    );
    scene.add(dust);

    const observer = new ResizeObserver(() => {
      const bounds = host.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    observer.observe(host);
    const bounds = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, bounds.width), Math.max(1, bounds.height), false);
    camera.aspect = Math.max(1, bounds.width) / Math.max(1, bounds.height);
    camera.updateProjectionMatrix();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let hoverX = 0;
    let hoverY = 0;
    const onPointerMove = (event: PointerEvent) => {
      const box = host.getBoundingClientRect();
      hoverX = (event.clientX - box.left) / Math.max(1, box.width) - 0.5;
      hoverY = (event.clientY - box.top) / Math.max(1, box.height) - 0.5;
    };
    host.addEventListener("pointermove", onPointerMove);
    let frame = 0;
    const start = performance.now();
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      const t = reducedMotion ? 0 : (now - start) * 0.001;
      sweep.rotation.z = -t * 0.65;
      dust.rotation.y = t * 0.035;
      animatedLandmarks.forEach((landmark) => { landmark.rotation.y = t * 0.9; });
      for (const pulse of pulses) {
        const f = 1 + (t % 2) * 1.8;
        pulse.scale.setScalar(f);
        (pulse.material as THREE.MeshBasicMaterial).opacity = 0.75 - (t % 2) * 0.3;
      }
      if (LOCATIONS.length > 1) {
        const progress = (t * 0.43) % (LOCATIONS.length - 1);
        const index = Math.floor(progress);
        const [x1, z1] = LOCATIONS[index];
        const [x2, z2] = LOCATIONS[index + 1];
        traveler.position.set(THREE.MathUtils.lerp(x1, x2, progress - index), 0.13, THREE.MathUtils.lerp(z1, z2, progress - index));
      }
      camera.position.x = Math.sin(t * 0.18) * 0.42 + hoverX * 1.5;
      camera.position.y = 5.5 + hoverY * 0.65;
      camera.lookAt(0, 0.12, 0);
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onPointerMove);
      observer.disconnect();
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.LineSegments || obj instanceof THREE.Points) {
          geometries.add(obj.geometry);
          const used = Array.isArray(obj.material) ? obj.material : [obj.material];
          used.forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geo) => geo.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [chapter, accent]);

  return <div className="story-intel-3d" ref={mountRef} aria-label="Animated 3D tactical map tracking the campaign route" />;
}