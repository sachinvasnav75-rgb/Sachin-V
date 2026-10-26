/**
 * Super Bike India 3D - Procedural 3D Models
 * Multi-part composite models following Three.js guidelines:
 * 3-12 parts per vehicle/prop, varied roughness/metalness, bottom-center grounded pivots.
 */

import * as THREE from 'three';
import { CustomizationState, VehicleId } from '../types';

// Helper: Procedural Canvas Textures
export function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt base
  ctx.fillStyle = '#222428';
  ctx.fillRect(0, 0, 512, 512);

  // Noise / gravel texture
  for (let i = 0; i < 20000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const brightness = Math.floor(Math.random() * 50 + 20);
    ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Yellow road dash markings
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(246, 60, 20, 140);
  ctx.fillRect(246, 320, 20, 140);

  // Side white lines
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(15, 0, 12, 512);
  ctx.fillRect(485, 0, 12, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createShopSignTexture(text: string, subtext: string, bgColor: string, textColor: string = '#ffffff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 128);

  // Decorative border
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#f59e0b';
  ctx.strokeRect(6, 6, 500, 116);

  // Main text
  ctx.fillStyle = textColor;
  ctx.font = 'bold 38px "Rajdhani", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 45);

  // Subtext
  ctx.fillStyle = '#fde047';
  ctx.font = '600 20px "Rajdhani", sans-serif';
  ctx.fillText(subtext, 256, 92);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Procedural Building Generator
export function createIndianBuilding(type: 'commercial' | 'dhaba' | 'tower' | 'garage', seed: number): THREE.Group {
  const group = new THREE.Group();

  let width = 12;
  let height = 18;
  let depth = 14;
  let wallColor = 0xe2e8f0;

  if (type === 'dhaba') {
    width = 10;
    height = 5;
    depth = 8;
    wallColor = 0xf59e0b; // Yellow-saffron dhaba
  } else if (type === 'tower') {
    width = 14;
    height = 36;
    depth = 14;
    wallColor = 0x334155; // Modern high-rise
  } else if (type === 'garage') {
    width = 16;
    height = 7;
    depth = 12;
    wallColor = 0x1e293b;
  } else {
    // Commercial shop
    width = 11;
    height = seed % 2 === 0 ? 14 : 20;
    depth = 11;
    wallColor = [0xd97706, 0x0284c7, 0x059669, 0xdc2626][seed % 4];
  }

  // 1. Main structure
  const mainGeo = new THREE.BoxGeometry(width, height, depth);
  const mainMat = new THREE.MeshStandardMaterial({
    color: wallColor,
    roughness: 0.85,
    metalness: 0.1,
  });
  const mainMesh = new THREE.Mesh(mainGeo, mainMat);
  mainMesh.position.y = height / 2;
  mainMesh.castShadow = true;
  mainMesh.receiveShadow = true;
  group.add(mainMesh);

  // 2. Base plinth / shop front
  const baseGeo = new THREE.BoxGeometry(width + 0.6, 1.2, depth + 0.6);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9, metalness: 0.05 });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 0.6;
  group.add(baseMesh);

  // 3. Shop signboard
  let signText = 'ROYAL MOTORS';
  let signSub = 'SUPERBIKE TUNING & REPAIR';
  let signBg = '#b91c1c';

  if (type === 'dhaba') {
    signText = 'SHER-E-PUNJAB DHABA';
    signSub = 'CHAI, SAMOSA & PARATHA';
    signBg = '#c2410c';
  } else if (type === 'garage') {
    signText = 'BHARAT SUPERBIKE GARAGE';
    signSub = 'DYNO TUNING & STUNT PARTS';
    signBg = '#ea580c';
  } else if (seed % 3 === 0) {
    signText = 'DELHI CHAI & SNACKS';
    signSub = 'HOT KULLHAD CHAI 24/7';
    signBg = '#047857';
  }

  const signTex = createShopSignTexture(signText, signSub, signBg);
  const signGeo = new THREE.PlaneGeometry(width * 0.75, 2.4);
  const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.4, metalness: 0.2 });
  const signMesh = new THREE.Mesh(signGeo, signMat);
  signMesh.position.set(0, type === 'dhaba' ? 3.6 : 4.5, depth / 2 + 0.05);
  group.add(signMesh);

  // 4. Windows grid for towers / commercial
  if (height >= 12) {
    const winGeo = new THREE.BoxGeometry(width * 0.8, height * 0.65, 0.2);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.15,
      metalness: 0.85,
    });
    const frontWin = new THREE.Mesh(winGeo, winMat);
    frontWin.position.set(0, height * 0.55, depth / 2 + 0.05);
    group.add(frontWin);

    const backWin = new THREE.Mesh(winGeo, winMat);
    backWin.position.set(0, height * 0.55, -depth / 2 - 0.05);
    group.add(backWin);
  }

  // 5. Roof tank / water cistern (Quintessential Indian rooftop detail)
  const tankGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.0, 12);
  const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5, metalness: 0.2 });
  const tank = new THREE.Mesh(tankGeo, tankMat);
  tank.position.set(width * 0.25, height + 1.0, depth * 0.2);
  tank.castShadow = true;
  group.add(tank);

  return group;
}

// Procedural Indian Stunt Ramp / Loop Structure
export function createStuntRamp(width = 8, height = 4.5, length = 16): THREE.Group {
  const group = new THREE.Group();

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(length, 0);
  shape.lineTo(length, height);
  shape.quadraticCurveTo(length * 0.4, height * 0.15, 0, 0);

  const extrudeSettings = {
    steps: 2,
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.2,
    bevelSegments: 3,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();

  // Vibrant high-vis stunt colors: Bright neon orange & black warning chevrons
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    roughness: 0.35,
    metalness: 0.6,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.y = Math.PI / 2;
  mesh.position.y = height / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  // Safety railings with neon glow strips
  const railGeo = new THREE.CylinderGeometry(0.08, 0.08, length * 1.05, 8);
  const neonMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8,
  });

  const railLeft = new THREE.Mesh(railGeo, neonMat);
  railLeft.rotation.z = Math.PI / 2;
  railLeft.position.set(-width / 2 - 0.1, height * 0.6, 0);
  group.add(railLeft);

  const railRight = railLeft.clone();
  railRight.position.x = width / 2 + 0.1;
  group.add(railRight);

  return group;
}

// Procedural Indian Heritage Gateway / Arch (Rajasthan / Delhi Fort Style)
export function createIndianGate(): THREE.Group {
  const group = new THREE.Group();
  const sandstoneMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Rajasthani red sandstone
    roughness: 0.9,
    metalness: 0.05,
  });

  // Twin giant pillars
  const pillarGeo = new THREE.CylinderGeometry(1.6, 2.0, 16, 12);
  const leftPillar = new THREE.Mesh(pillarGeo, sandstoneMat);
  leftPillar.position.set(-10, 8, 0);
  leftPillar.castShadow = true;
  group.add(leftPillar);

  const rightPillar = leftPillar.clone();
  rightPillar.position.x = 10;
  group.add(rightPillar);

  // Overhead ornamental arch
  const archGeo = new THREE.BoxGeometry(24, 3, 3.5);
  const arch = new THREE.Mesh(archGeo, sandstoneMat);
  arch.position.set(0, 16.5, 0);
  arch.castShadow = true;
  group.add(arch);

  // Ornamental dome (Chhatri dome)
  const domeGeo = new THREE.SphereGeometry(2.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7, metalness: 0.2 });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.set(0, 18, 0);
  group.add(dome);

  return group;
}

// Procedural Tree (Indian Banyan / Neem / Palm)
export function createIndianTree(type: 'palm' | 'neem' = 'neem', seed = 0): THREE.Group {
  const group = new THREE.Group();

  if (type === 'palm') {
    // Curved trunk
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 9, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95, metalness: 0.05 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 4.5;
    trunk.rotation.z = 0.08 * ((seed % 3) - 1);
    trunk.castShadow = true;
    group.add(trunk);

    // Palm fronds
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8, metalness: 0.1 });
    for (let i = 0; i < 6; i++) {
      const frondGeo = new THREE.ConeGeometry(1.8, 4.2, 5);
      const frond = new THREE.Mesh(frondGeo, foliageMat);
      frond.position.set(0, 8.8, 0);
      frond.rotation.z = 1.1;
      frond.rotation.y = (i * Math.PI) / 3;
      group.add(frond);
    }
  } else {
    // Neem / Peepal tree
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 4.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c2b14, roughness: 0.95 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.25;
    trunk.castShadow = true;
    group.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 });
    const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8), foliageMat);
    crown1.position.set(0, 5.2, 0);
    crown1.castShadow = true;
    group.add(crown1);

    const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.0), foliageMat);
    crown2.position.set(1.2, 5.8, -0.8);
    crown2.castShadow = true;
    group.add(crown2);
  }

  return group;
}

// Procedural Flyover Overpass Section
export function createFlyoverSection(length = 40, width = 12, height = 9): THREE.Group {
  const group = new THREE.Group();

  // Bridge road deck
  const deckGeo = new THREE.BoxGeometry(width, 1.2, length);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, metalness: 0.1 });
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.y = height;
  deck.receiveShadow = true;
  deck.castShadow = true;
  group.add(deck);

  // Road surface
  const roadTex = createAsphaltTexture();
  roadTex.repeat.set(1, 4);
  const roadGeo = new THREE.PlaneGeometry(width * 0.9, length);
  const roadMat = new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.7, metalness: 0.1 });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.y = height + 0.62;
  road.receiveShadow = true;
  group.add(road);

  // Twin concrete pillars
  const pillarGeo = new THREE.CylinderGeometry(1.2, 1.5, height, 12);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9, metalness: 0.05 });
  
  const p1 = new THREE.Mesh(pillarGeo, pillarMat);
  p1.position.set(-width * 0.28, height / 2, 0);
  p1.castShadow = true;
  group.add(p1);

  const p2 = new THREE.Mesh(pillarGeo, pillarMat);
  p2.position.set(width * 0.28, height / 2, 0);
  p2.castShadow = true;
  group.add(p2);

  // Guardrails with reflector stripes
  const railGeo = new THREE.BoxGeometry(0.3, 1.2, length);
  const railMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.7 });
  const leftRail = new THREE.Mesh(railGeo, railMat);
  leftRail.position.set(-width / 2 + 0.2, height + 1.2, 0);
  group.add(leftRail);

  const rightRail = leftRail.clone();
  rightRail.position.x = width / 2 - 0.2;
  group.add(rightRail);

  return group;
}

// -------------------------------------------------------------
// COMPOSITE VEHICLE BUILDERS (10-18 parts per vehicle)
// -------------------------------------------------------------

export interface VehicleMeshBundle {
  root: THREE.Group;
  frontWheel: THREE.Group;
  rearWheel: THREE.Group;
  handlebar: THREE.Group;
  headlight: THREE.SpotLight | THREE.PointLight;
  bodyMeshes: THREE.Mesh[];
  exhaustMesh: THREE.Mesh;
  neonMesh?: THREE.Mesh;
}

export function buildMotorcycleModel(
  vehicleId: VehicleId,
  customState: CustomizationState
): VehicleMeshBundle {
  const root = new THREE.Group();
  const bodyMeshes: THREE.Mesh[] = [];

  const mainColor = new THREE.Color(customState.color);
  const accentColor = new THREE.Color(customState.accentColor);
  const wheelColor = new THREE.Color(customState.wheelColor);

  // Common materials
  const fairingMat = new THREE.MeshStandardMaterial({
    color: mainColor,
    roughness: 0.2,
    metalness: 0.7,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.3,
    metalness: 0.6,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.12,
    metalness: 0.95,
  });

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.5,
    metalness: 0.8,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x171717,
    roughness: 0.9,
    metalness: 0.1,
  });

  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x09090b,
    roughness: 0.8,
    metalness: 0.05,
  });

  // WHEEL BUILDER (Rim + Tire + Brake Disc + Hub)
  const buildWheel = (radius: number, width: number): THREE.Group => {
    const wheelGroup = new THREE.Group();

    // 1. Tire
    const tireGeo = new THREE.TorusGeometry(radius, width * 0.48, 12, 24);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.y = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    // 2. Rim
    const rimMat = new THREE.MeshStandardMaterial({ color: wheelColor, roughness: 0.2, metalness: 0.85 });
    const rimGeo = new THREE.CylinderGeometry(radius * 0.75, radius * 0.75, width * 0.6, 16);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    // 3. Spokes / Rim Blades
    for (let i = 0; i < 5; i++) {
      const spokeGeo = new THREE.BoxGeometry(0.04, radius * 1.35, width * 0.3);
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      spoke.rotation.x = (i * Math.PI) / 5;
      wheelGroup.add(spoke);
    }

    // 4. Perforated Brake Disc
    const discGeo = new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, 0.03, 16);
    const disc = new THREE.Mesh(discGeo, chromeMat);
    disc.rotation.z = Math.PI / 2;
    disc.position.x = width * 0.35;
    wheelGroup.add(disc);

    return wheelGroup;
  };

  // 1. CHASSIS / FRAME
  const frameGeo = new THREE.BoxGeometry(0.4, 0.35, 1.4);
  const frame = new THREE.Mesh(frameGeo, darkMetalMat);
  frame.position.set(0, 0.75, 0);
  frame.castShadow = true;
  root.add(frame);

  // 2. ENGINE BLOCK
  const engineGeo = new THREE.BoxGeometry(0.48, 0.45, 0.65);
  const engine = new THREE.Mesh(engineGeo, chromeMat);
  engine.position.set(0, 0.55, 0.05);
  engine.castShadow = true;
  root.add(engine);

  // Engine cooling fins
  for (let i = 0; i < 4; i++) {
    const finGeo = new THREE.BoxGeometry(0.52, 0.02, 0.55);
    const fin = new THREE.Mesh(finGeo, darkMetalMat);
    fin.position.set(0, 0.45 + i * 0.08, 0.05);
    root.add(fin);
  }

  // 3. FUEL TANK (Sculpted)
  let tankGeo: THREE.BufferGeometry;
  if (vehicleId === 'bullet350') {
    // Teardrop classic tank
    tankGeo = new THREE.SphereGeometry(0.36, 12, 12);
    tankGeo.scale(0.8, 0.7, 1.4);
  } else {
    // Aggressive muscular superbike tank
    tankGeo = new THREE.BoxGeometry(0.52, 0.38, 0.85);
  }
  const tank = new THREE.Mesh(tankGeo, fairingMat);
  tank.position.set(0, 0.98, 0.22);
  tank.castShadow = true;
  root.add(tank);
  bodyMeshes.push(tank);

  // 4. SEAT
  const seatGeo = new THREE.BoxGeometry(0.38, 0.12, 0.65);
  const seat = new THREE.Mesh(seatGeo, leatherMat);
  seat.position.set(0, 0.94, -0.38);
  seat.castShadow = true;
  root.add(seat);

  // 5. AERODYNAMIC FAIRINGS (Superbikes get full fairing, Bullet/Duke naked)
  if (vehicleId === 'hayabusa' || vehicleId === 'ninja_h2' || vehicleId === 'pulsar220') {
    // Front aerodynamic nose cone
    const noseGeo = new THREE.ConeGeometry(0.42, 0.9, 8);
    const nose = new THREE.Mesh(noseGeo, fairingMat);
    nose.rotation.x = -Math.PI / 2.3;
    nose.position.set(0, 1.05, 0.95);
    nose.castShadow = true;
    root.add(nose);
    bodyMeshes.push(nose);

    // Windshield (dark tinted)
    const shieldGeo = new THREE.PlaneGeometry(0.35, 0.45);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.8,
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.rotation.x = -Math.PI / 3;
    shield.position.set(0, 1.25, 0.78);
    root.add(shield);

    // Side aerofoils / winglets for Ninja H2R
    if (vehicleId === 'ninja_h2') {
      const wingGeo = new THREE.BoxGeometry(0.85, 0.04, 0.22);
      const wing = new THREE.Mesh(wingGeo, accentMat);
      wing.position.set(0, 0.92, 0.85);
      root.add(wing);
    }
  }

  // 6. EXHAUST SYSTEM
  const exhaustGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.8, 12);
  const exhaustMat = new THREE.MeshStandardMaterial({
    color: customState.exhaust === 'akrapovic' ? 0x27272a : (customState.exhaust === 'sc_project' ? 0x1e293b : 0xe2e8f0),
    roughness: 0.15,
    metalness: 0.9,
  });
  const exhaustMesh = new THREE.Mesh(exhaustGeo, exhaustMat);
  exhaustMesh.rotation.x = Math.PI / 2.6;
  exhaustMesh.rotation.z = -0.15;
  exhaustMesh.position.set(0.28, 0.52, -0.6);
  exhaustMesh.castShadow = true;
  root.add(exhaustMesh);

  // 7. FRONT FORKS & HANDLEBAR (steerable assembly)
  const handlebar = new THREE.Group();
  handlebar.position.set(0, 1.08, 0.65);

  // Twin inverted shock absorbers
  const forkGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.9, 10);
  const forkMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.9 }); // Gold anodized forks
  
  const leftFork = new THREE.Mesh(forkGeo, forkMat);
  leftFork.rotation.x = 0.32;
  leftFork.position.set(-0.16, -0.22, 0.08);
  handlebar.add(leftFork);

  const rightFork = leftFork.clone();
  rightFork.position.x = 0.16;
  handlebar.add(rightFork);

  // Handlebar grips
  const barGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.75, 8);
  const bar = new THREE.Mesh(barGeo, darkMetalMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 0.1, -0.05);
  handlebar.add(bar);

  // Left & right rubber grips
  const gripGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.15, 8);
  const leftGrip = new THREE.Mesh(gripGeo, leatherMat);
  leftGrip.rotation.z = Math.PI / 2;
  leftGrip.position.set(-0.32, 0.1, -0.05);
  handlebar.add(leftGrip);

  const rightGrip = leftGrip.clone();
  rightGrip.position.x = 0.32;
  handlebar.add(rightGrip);

  // Rearview mirrors
  const mirrorGeo = new THREE.BoxGeometry(0.12, 0.07, 0.02);
  const leftMirror = new THREE.Mesh(mirrorGeo, chromeMat);
  leftMirror.position.set(-0.35, 0.22, 0.02);
  handlebar.add(leftMirror);

  const rightMirror = leftMirror.clone();
  rightMirror.position.x = 0.35;
  handlebar.add(rightMirror);

  // Digital dash / instrument cluster
  const dashGeo = new THREE.BoxGeometry(0.2, 0.04, 0.12);
  const dashMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.5 });
  const dash = new THREE.Mesh(dashGeo, dashMat);
  dash.position.set(0, 0.08, 0.08);
  handlebar.add(dash);

  root.add(handlebar);

  // 8. WHEELS
  const wheelRadius = 0.42;
  const frontWheel = buildWheel(wheelRadius, 0.18);
  frontWheel.position.set(0, wheelRadius, 0.95);
  root.add(frontWheel);

  const rearWheel = buildWheel(wheelRadius, 0.26);
  rearWheel.position.set(0, wheelRadius, -0.92);
  root.add(rearWheel);

  // Rear swingarm
  const swingarmGeo = new THREE.BoxGeometry(0.08, 0.08, 0.85);
  const leftArm = new THREE.Mesh(swingarmGeo, darkMetalMat);
  leftArm.position.set(-0.18, 0.48, -0.5);
  leftArm.rotation.x = -0.15;
  root.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 0.18;
  root.add(rightArm);

  // 9. HEADLIGHT & TAILLIGHT
  const lightGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });
  const headlightMesh = new THREE.Mesh(lightGeo, lightMat);
  headlightMesh.position.set(0, 0.95, 1.15);
  root.add(headlightMesh);

  const headlight = new THREE.SpotLight(0xfffbeb, 4.5, 45, Math.PI / 5, 0.3);
  headlight.position.set(0, 0.95, 1.15);
  headlight.target.position.set(0, 0, 15);
  root.add(headlight);
  root.add(headlight.target);

  // Tail light (Red LED strip)
  const tailGeo = new THREE.BoxGeometry(0.24, 0.06, 0.05);
  const tailMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 1.2,
  });
  const taillight = new THREE.Mesh(tailGeo, tailMat);
  taillight.position.set(0, 0.98, -0.88);
  root.add(taillight);

  // 10. NEON UNDERGLOW (if enabled)
  let neonMesh: THREE.Mesh | undefined;
  if (customState.neonEnabled) {
    const neonGeo = new THREE.BoxGeometry(0.35, 0.03, 0.9);
    const neonColor = new THREE.Color(customState.neonColor || '#06b6d4');
    const nMat = new THREE.MeshStandardMaterial({
      color: neonColor,
      emissive: neonColor,
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });
    neonMesh = new THREE.Mesh(neonGeo, nMat);
    neonMesh.position.set(0, 0.22, 0);
    root.add(neonMesh);
  }

  return {
    root,
    frontWheel,
    rearWheel,
    handlebar,
    headlight,
    bodyMeshes,
    exhaustMesh,
    neonMesh,
  };
}

// Procedural Indian Auto-Rickshaw (Tuk-Tuk) Model
export function buildAutoRickshawModel(): THREE.Group {
  const root = new THREE.Group();

  // Distinctive Indian Auto Rickshaw colors: Yellow top canopy, Emerald green lower body
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4, metalness: 0.2 });
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5, metalness: 0.2 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7, metalness: 0.4 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9, metalness: 0.1 });

  // 1. Lower chassis / body
  const bodyGeo = new THREE.BoxGeometry(1.6, 0.75, 2.6);
  const body = new THREE.Mesh(bodyGeo, greenMat);
  body.position.set(0, 0.75, 0);
  body.castShadow = true;
  root.add(body);

  // 2. Front aerodynamic tapered nose
  const noseGeo = new THREE.ConeGeometry(0.85, 1.0, 4);
  const nose = new THREE.Mesh(noseGeo, greenMat);
  nose.rotation.y = Math.PI / 4;
  nose.rotation.x = -Math.PI / 2.5;
  nose.position.set(0, 0.85, 1.45);
  root.add(nose);

  // 3. Iconic Yellow Canopy Roof
  const roofGeo = new THREE.BoxGeometry(1.65, 0.2, 2.5);
  const roof = new THREE.Mesh(roofGeo, yellowMat);
  roof.position.set(0, 1.85, -0.1);
  roof.castShadow = true;
  root.add(roof);

  // Canopy vertical metal pillars
  const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8);
  [-0.75, 0.75].forEach((px) => {
    [-1.0, 0.2, 1.1].forEach((pz) => {
      const p = new THREE.Mesh(pillarGeo, blackMat);
      p.position.set(px, 1.35, pz);
      root.add(p);
    });
  });

  // 4. Passenger bench seat
  const seatGeo = new THREE.BoxGeometry(1.4, 0.25, 0.65);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.8 });
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(0, 0.9, -0.6);
  root.add(seat);

  // 5. 3 Wheels (1 Front Center, 2 Rear)
  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 14);
  wheelGeo.rotateZ(Math.PI / 2);

  const frontWheel = new THREE.Mesh(wheelGeo, tireMat);
  frontWheel.position.set(0, 0.32, 1.3);
  frontWheel.castShadow = true;
  root.add(frontWheel);

  const rearLeftWheel = new THREE.Mesh(wheelGeo, tireMat);
  rearLeftWheel.position.set(-0.88, 0.32, -0.75);
  rearLeftWheel.castShadow = true;
  root.add(rearLeftWheel);

  const rearRightWheel = rearLeftWheel.clone();
  rearRightWheel.position.x = 0.88;
  root.add(rearRightWheel);

  // 6. Round center headlight
  const lightGeo = new THREE.SphereGeometry(0.14, 12, 12);
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffedd5, emissiveIntensity: 1.0 });
  const headlight = new THREE.Mesh(lightGeo, lightMat);
  headlight.position.set(0, 0.85, 1.88);
  root.add(headlight);

  return root;
}

// Procedural Thar 4x4 / Indian SUV Model
export function buildTharSUVModel(): THREE.Group {
  const root = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.5 }); // Deep crimson red
  const blackTrimMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85, metalness: 0.2 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.9, metalness: 0.1 });

  // 1. Lower Boxy SUV Body
  const bodyGeo = new THREE.BoxGeometry(2.1, 0.9, 4.4);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, 0.95, 0);
  body.castShadow = true;
  root.add(body);

  // 2. Cabin / Hardtop
  const cabinGeo = new THREE.BoxGeometry(1.95, 0.85, 2.5);
  const cabin = new THREE.Mesh(cabinGeo, blackTrimMat);
  cabin.position.set(0, 1.82, -0.4);
  cabin.castShadow = true;
  root.add(cabin);

  // Windows
  const windGeo = new THREE.BoxGeometry(1.98, 0.65, 0.05);
  const windshield = new THREE.Mesh(windGeo, glassMat);
  windshield.rotation.x = 0.2;
  windshield.position.set(0, 1.8, 0.86);
  root.add(windshield);

  // 3. Heavy Duty Front Bumper & Vertical Slats Grille
  const bumperGeo = new THREE.BoxGeometry(2.15, 0.4, 0.35);
  const bumper = new THREE.Mesh(bumperGeo, blackTrimMat);
  bumper.position.set(0, 0.65, 2.25);
  root.add(bumper);

  // 4. Twin Round Headlights
  const lightGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 14);
  lightGeo.rotateX(Math.PI / 2);
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0 });

  const leftLight = new THREE.Mesh(lightGeo, lightMat);
  leftLight.position.set(-0.65, 1.05, 2.22);
  root.add(leftLight);

  const rightLight = leftLight.clone();
  rightLight.position.x = 0.65;
  root.add(rightLight);

  // 5. Four Rugged All-Terrain Wheels
  const wheelRadius = 0.52;
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.35, 16);
  wheelGeo.rotateZ(Math.PI / 2);

  [
    { x: -1.08, z: 1.4 },
    { x: 1.08, z: 1.4 },
    { x: -1.08, z: -1.4 },
    { x: 1.08, z: -1.4 },
  ].forEach((pos) => {
    const wheel = new THREE.Mesh(wheelGeo, tireMat);
    wheel.position.set(pos.x, wheelRadius, pos.z);
    wheel.castShadow = true;
    root.add(wheel);
  });

  return root;
}
