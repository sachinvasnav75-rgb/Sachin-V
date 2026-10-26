/**
 * Super Bike India 3D - Open World Generator
 * Expansive Indian map: City roads, Grand Trunk highway flyover, Rajasthan desert arch,
 * Stunt mega arena, Bharat Petroleum pump, roadside dhabas, and perimeter hills.
 */

import * as THREE from 'three';
import {
  createAsphaltTexture,
  createShopSignTexture,
  createIndianBuilding,
  createIndianGate,
  createIndianTree,
  createStuntRamp,
  createFlyoverSection,
} from './proceduralModels';

export interface RampCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  baseY: number;
  topY: number;
  rotationY: number;
}

export interface CheckpointRing {
  id: number;
  position: THREE.Vector3;
  radius: number;
  mesh: THREE.Mesh;
  passed: boolean;
}

export class WorldManager {
  public scene: THREE.Group;
  public ramps: RampCollider[] = [];
  public checkpointRings: CheckpointRing[] = [];
  public petrolPumpPos = new THREE.Vector3(30, 0, 45);
  public garagePos = new THREE.Vector3(-35, 0, -40);
  public megaRampPos = new THREE.Vector3(120, 0, -120);

  constructor() {
    this.scene = new THREE.Group();
  }

  public buildWorld() {
    this.buildTerrain();
    this.buildRoads();
    this.buildCityDistrict();
    this.buildHighwayFlyover();
    this.buildDesertHeritageZone();
    this.buildStuntArena();
    this.buildPetrolStation();
    this.buildCheckpointCourse();
    this.buildPerimeterMountains();
  }

  // 1. Terrain & Grass/Desert Base
  private buildTerrain() {
    // Large ground plane
    const groundGeo = new THREE.PlaneGeometry(600, 600, 40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46, // Rich dark earth / road verge
      roughness: 0.95,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Desert patch for Heritage zone (X: -180 to -60, Z: 60 to 200)
    const desertGeo = new THREE.PlaneGeometry(160, 160);
    const desertMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Rajasthani golden desert sand
      roughness: 0.9,
      metalness: 0.05,
    });
    const desert = new THREE.Mesh(desertGeo, desertMat);
    desert.rotation.x = -Math.PI / 2;
    desert.position.set(-110, -0.02, 110);
    desert.receiveShadow = true;
    this.scene.add(desert);
  }

  // 2. Road Network
  private buildRoads() {
    const roadTex = createAsphaltTexture();
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.8,
      metalness: 0.1,
    });

    // Main Avenue (North-South): 20m wide x 400m long
    const mainAvenueGeo = new THREE.PlaneGeometry(20, 400);
    const mainAvenueTex = createAsphaltTexture();
    mainAvenueTex.repeat.set(2, 40);
    const mainAvenueMat = new THREE.MeshStandardMaterial({ map: mainAvenueTex, roughness: 0.8 });
    const mainAvenue = new THREE.Mesh(mainAvenueGeo, mainAvenueMat);
    mainAvenue.rotation.x = -Math.PI / 2;
    mainAvenue.position.set(0, 0.01, 0);
    mainAvenue.receiveShadow = true;
    this.scene.add(mainAvenue);

    // Cross Boulevard (East-West): 20m wide x 400m long
    const crossGeo = new THREE.PlaneGeometry(400, 20);
    const crossTex = createAsphaltTexture();
    crossTex.repeat.set(40, 2);
    const crossMat = new THREE.MeshStandardMaterial({ map: crossTex, roughness: 0.8 });
    const crossRoad = new THREE.Mesh(crossGeo, crossMat);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.position.set(0, 0.02, 0);
    crossRoad.receiveShadow = true;
    this.scene.add(crossRoad);

    // Stunt Arena Speedway Ring (Outer perimeter road)
    const ringRoadGeo = new THREE.RingGeometry(170, 192, 48);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
    const ringRoad = new THREE.Mesh(ringRoadGeo, ringMat);
    ringRoad.rotation.x = -Math.PI / 2;
    ringRoad.position.set(0, 0.01, 0);
    ringRoad.receiveShadow = true;
    this.scene.add(ringRoad);

    // Roadside Streetlights along main avenue
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.18, 8, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const armGeo = new THREE.BoxGeometry(2.4, 0.1, 0.1);
    const lightHeadGeo = new THREE.BoxGeometry(0.8, 0.2, 0.4);
    const lightGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfde047,
      emissiveIntensity: 1.5,
    });

    for (let z = -180; z <= 180; z += 40) {
      if (Math.abs(z) < 15) continue; // Don't block intersection
      [-11, 11].forEach((xSide) => {
        const lightGroup = new THREE.Group();
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 4;
        lightGroup.add(pole);

        const arm = new THREE.Mesh(armGeo, poleMat);
        arm.position.set(xSide > 0 ? -1.0 : 1.0, 7.8, 0);
        lightGroup.add(arm);

        const bulb = new THREE.Mesh(lightHeadGeo, lightGlowMat);
        bulb.position.set(xSide > 0 ? -1.8 : 1.8, 7.6, 0);
        lightGroup.add(bulb);

        lightGroup.position.set(xSide, 0, z);
        this.scene.add(lightGroup);
      });
    }
  }

  // 3. Indian City District (Commercial Shops, Towers, Dhabas)
  private buildCityDistrict() {
    // Quadrant: X: 15 to 90, Z: 15 to 90
    const cityConfigs = [
      { type: 'dhaba' as const, x: 22, z: 25 },
      { type: 'commercial' as const, x: 22, z: 50 },
      { type: 'tower' as const, x: 42, z: 25 },
      { type: 'commercial' as const, x: 42, z: 65 },
      { type: 'tower' as const, x: 65, z: 35 },
      { type: 'dhaba' as const, x: 65, z: 65 },
      // Opposite side
      { type: 'garage' as const, x: -35, z: -40 },
      { type: 'commercial' as const, x: -35, z: -65 },
      { type: 'tower' as const, x: -55, z: -35 },
      { type: 'commercial' as const, x: -55, z: -65 },
    ];

    cityConfigs.forEach((cfg, idx) => {
      const bldg = createIndianBuilding(cfg.type, idx);
      bldg.position.set(cfg.x, 0, cfg.z);
      this.scene.add(bldg);
    });

    // Add trees along pavements
    for (let z = 20; z <= 80; z += 15) {
      const tree = createIndianTree('neem', z);
      tree.position.set(13.5, 0, z);
      this.scene.add(tree);

      const tree2 = createIndianTree('palm', z);
      tree2.position.set(-13.5, 0, -z);
      this.scene.add(tree2);
    }
  }

  // 4. Grand Trunk Highway Overpass / Flyover
  private buildHighwayFlyover() {
    // Flyover elevates up to 9m, spans across East road
    const flyoverGroup = new THREE.Group();

    // 4 sections of 40m each
    for (let i = 0; i < 4; i++) {
      const section = createFlyoverSection(40, 12, 9);
      section.position.set(80 + i * 38, 0, 0);
      section.rotation.y = Math.PI / 2;
      flyoverGroup.add(section);
    }

    // Approach Ramp 1 (West entrance ascending)
    const rampLength = 36;
    const rampShape = new THREE.Shape();
    rampShape.moveTo(0, 0);
    rampShape.lineTo(rampLength, 0);
    rampShape.lineTo(rampLength, 9);
    rampShape.lineTo(0, 0);

    const rampGeo = new THREE.ExtrudeGeometry(rampShape, { depth: 12, bevelEnabled: false });
    rampGeo.center();
    const rampMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const rampMesh = new THREE.Mesh(rampGeo, rampMat);
    rampMesh.position.set(44, 4.5, 0);
    rampMesh.rotation.y = Math.PI / 2;
    flyoverGroup.add(rampMesh);

    // Approach Ramp 2 (East exit descending)
    const exitRamp = rampMesh.clone();
    exitRamp.rotation.y = -Math.PI / 2;
    exitRamp.position.set(234, 4.5, 0);
    flyoverGroup.add(exitRamp);

    this.scene.add(flyoverGroup);

    // Register ramp colliders
    this.ramps.push({
      minX: 38,
      maxX: 50,
      minZ: -6,
      maxZ: 6,
      baseY: 0,
      topY: 9,
      rotationY: Math.PI / 2,
    });
  }

  // 5. Desert & Rajasthan Heritage Gateway Zone
  private buildDesertHeritageZone() {
    const gate = createIndianGate();
    gate.position.set(-100, 0, 100);
    this.scene.add(gate);

    // Dunes and desert palm trees
    const duneMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.95 });
    for (let i = 0; i < 6; i++) {
      const duneGeo = new THREE.SphereGeometry(15, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      duneGeo.scale(1.4, 0.25, 1.2);
      const dune = new THREE.Mesh(duneGeo, duneMat);
      dune.position.set(-80 - i * 18, 0, 70 + (i % 3) * 25);
      this.scene.add(dune);

      const palm = createIndianTree('palm', i * 7);
      palm.position.set(-75 - i * 16, 0, 65 + (i % 3) * 22);
      this.scene.add(palm);
    }
  }

  // 6. Stunt Mega Arena
  private buildStuntArena() {
    // Quadrant: X: 60 to 180, Z: -60 to -180
    const stuntBaseGeo = new THREE.PlaneGeometry(120, 120);
    const stuntBaseMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
    const stuntBase = new THREE.Mesh(stuntBaseGeo, stuntBaseMat);
    stuntBase.rotation.x = -Math.PI / 2;
    stuntBase.position.set(120, 0.05, -120);
    stuntBase.receiveShadow = true;
    this.scene.add(stuntBase);

    // Stunt Ramp 1: Super Jump ramp facing South
    const ramp1 = createStuntRamp(10, 6, 20);
    ramp1.position.set(100, 0, -80);
    this.scene.add(ramp1);

    this.ramps.push({
      minX: 95,
      maxX: 105,
      minZ: -90,
      maxZ: -70,
      baseY: 0,
      topY: 6,
      rotationY: 0,
    });

    // Stunt Ramp 2: Mega High Sky Ramp (elevation 15m)
    const ramp2 = createStuntRamp(12, 14, 34);
    ramp2.position.set(140, 0, -140);
    this.scene.add(ramp2);

    this.ramps.push({
      minX: 134,
      maxX: 146,
      minZ: -157,
      maxZ: -123,
      baseY: 0,
      topY: 14,
      rotationY: 0,
    });

    // Ring of Fire (Torus with flame emissive)
    const ringGeo = new THREE.TorusGeometry(5, 0.4, 12, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xef4444,
      emissiveIntensity: 2.5,
      roughness: 0.2,
    });
    const ringOfFire = new THREE.Mesh(ringGeo, ringMat);
    ringOfFire.position.set(100, 10, -50);
    this.scene.add(ringOfFire);

    // Neon Stunt Target Platform
    const targetGeo = new THREE.CylinderGeometry(8, 8, 1, 24);
    const targetMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const targetPlatform = new THREE.Mesh(targetGeo, targetMat);
    targetPlatform.position.set(100, 0.5, -20);
    this.scene.add(targetPlatform);
  }

  // 7. Bharat Petroleum Pump
  private buildPetrolStation() {
    const group = new THREE.Group();

    // Canopy roof with Indian tricolor / Bharat Petroleum blue & yellow
    const canopyGeo = new THREE.BoxGeometry(22, 1.2, 14);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.5 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 5.5, 0);
    canopy.castShadow = true;
    group.add(canopy);

    // Signboard on canopy
    const signTex = createShopSignTexture('BHARAT PETROLEUM', 'HIGH OCTANE SPEED PETROL & AIR', '#0369a1', '#fef08a');
    const signGeo = new THREE.PlaneGeometry(16, 2.0);
    const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.3 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 5.5, 7.05);
    group.add(sign);

    // 4 Support Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.35, 0.35, 5.5, 12);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.7 });
    [-7, 7].forEach((px) => {
      [-4.5, 4.5].forEach((pz) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(px, 2.75, pz);
        group.add(pillar);
      });
    });

    // 2 Fuel Dispenser Units (Orange & blue)
    [-3.5, 3.5].forEach((px) => {
      const pumpGeo = new THREE.BoxGeometry(1.2, 2.2, 0.8);
      const pumpMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
      const pump = new THREE.Mesh(pumpGeo, pumpMat);
      pump.position.set(px, 1.1, 0);
      pump.castShadow = true;
      group.add(pump);
    });

    group.position.copy(this.petrolPumpPos);
    this.scene.add(group);
  }

  // 8. Career Checkpoint Rings
  private buildCheckpointCourse() {
    const courseLocations = [
      new THREE.Vector3(0, 2.5, 40),
      new THREE.Vector3(0, 2.5, 100),
      new THREE.Vector3(44, 5.0, 0),
      new THREE.Vector3(120, 10.5, 0),
      new THREE.Vector3(180, 10.5, 0),
      new THREE.Vector3(100, 4.0, -50),
      new THREE.Vector3(-40, 2.5, -40),
      new THREE.Vector3(-100, 3.5, 100),
    ];

    const ringGeo = new THREE.TorusGeometry(3.2, 0.22, 10, 20);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });

    courseLocations.forEach((pos, idx) => {
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.rotation.y = idx % 2 === 0 ? 0 : Math.PI / 2;
      this.scene.add(ringMesh);

      this.checkpointRings.push({
        id: idx + 1,
        position: pos,
        radius: 3.5,
        mesh: ringMesh,
        passed: false,
      });
    });
  }

  // 9. Natural Perimeter Barriers (Mountain hills, rock outcrops)
  private buildPerimeterMountains() {
    // Three.js directive: Outdoor arenas must never be boxed inside rectangular indoor walls.
    // Instead, extend terrain and bound perimeters with natural mountain ridges and rock outcrops.
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.95,
      metalness: 0.05,
    });

    const numRidges = 36;
    const radius = 270;
    for (let i = 0; i < numRidges; i++) {
      const angle = (i / numRidges) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const coneHeight = 35 + ((i * 17) % 25);
      const coneRadius = 25 + ((i * 13) % 15);
      const mountainGeo = new THREE.ConeGeometry(coneRadius, coneHeight, 7);
      const mountain = new THREE.Mesh(mountainGeo, mountainMat);
      mountain.position.set(x, coneHeight / 2 - 2, z);
      mountain.rotation.y = (i * 1.3);
      this.scene.add(mountain);
    }
  }

  // Elevation calculation at any (x, z) coordinate
  public getGroundHeight(x: number, z: number): number {
    // 1. Check overpass flyover bridge
    // Flyover deck: X: 44 to 234, Z: -6 to 6
    if (z >= -6 && z <= 6) {
      if (x >= 44 && x <= 75) {
        // Ascending ramp
        return ((x - 44) / 31) * 9;
      } else if (x > 75 && x < 200) {
        // Elevated flyover deck
        return 9.0;
      } else if (x >= 200 && x <= 234) {
        // Descending exit ramp
        return (1 - (x - 200) / 34) * 9;
      }
    }

    // 2. Check stunt ramps
    for (const ramp of this.ramps) {
      if (x >= ramp.minX && x <= ramp.maxX && z >= ramp.minZ && z <= ramp.maxZ) {
        const factor = (z - ramp.minZ) / (ramp.maxZ - ramp.minZ);
        return ramp.baseY + factor * (ramp.topY - ramp.baseY);
      }
    }

    // 3. Sand dunes in heritage zone
    if (x < -60 && x > -160 && z > 60 && z < 160) {
      const dist = Math.hypot(x - (-100), z - 100);
      return Math.max(0, Math.sin(dist * 0.1) * 0.8);
    }

    return 0;
  }
}
