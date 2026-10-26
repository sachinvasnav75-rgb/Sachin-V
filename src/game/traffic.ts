/**
 * Super Bike India 3D - AI Traffic System
 * Realistic Indian traffic (Auto-Rickshaws, Cars, and Cruiser Bikes) patrolling lanes.
 */

import * as THREE from 'three';
import { buildAutoRickshawModel } from './proceduralModels';

export interface TrafficVehicle {
  mesh: THREE.Group;
  type: 'rickshaw' | 'car' | 'bike';
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  speed: number;
  lane: 'north' | 'south' | 'east' | 'west';
  boundingRadius: number;
}

export class TrafficManager {
  public vehicles: TrafficVehicle[] = [];
  public group: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
  }

  public initTraffic(count = 12) {
    for (let i = 0; i < count; i++) {
      const isRickshaw = i % 2 === 0;
      let mesh: THREE.Group;

      if (isRickshaw) {
        mesh = buildAutoRickshawModel();
      } else {
        mesh = this.buildSedanCar();
      }

      const lane = (['north', 'south', 'east', 'west'] as const)[i % 4];
      const pos = new THREE.Vector3();
      const speed = 12 + Math.random() * 8; // km/h translated to m/s (~3.5-5.5)

      if (lane === 'north') {
        pos.set(4.5, 0, -180 + i * 30);
        mesh.rotation.y = 0;
      } else if (lane === 'south') {
        pos.set(-4.5, 0, 180 - i * 30);
        mesh.rotation.y = Math.PI;
      } else if (lane === 'east') {
        pos.set(-180 + i * 30, 0, 4.5);
        mesh.rotation.y = Math.PI / 2;
      } else {
        pos.set(180 - i * 30, 0, -4.5);
        mesh.rotation.y = -Math.PI / 2;
      }

      mesh.position.copy(pos);
      this.group.add(mesh);

      this.vehicles.push({
        mesh,
        type: isRickshaw ? 'rickshaw' : 'car',
        position: pos,
        velocity: new THREE.Vector3(),
        speed,
        lane,
        boundingRadius: isRickshaw ? 1.5 : 2.2,
      });
    }
  }

  private buildSedanCar(): THREE.Group {
    const root = new THREE.Group();
    const colors = [0xffffff, 0xd97706, 0x2563eb, 0x475569];
    const carColor = colors[Math.floor(Math.random() * colors.length)];

    const bodyMat = new THREE.MeshStandardMaterial({ color: carColor, roughness: 0.3, metalness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.9 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.9 });

    // Chassis
    const chassisGeo = new THREE.BoxGeometry(1.8, 0.7, 3.8);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.6;
    chassis.castShadow = true;
    root.add(chassis);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.6, 0.65, 2.0);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.25, -0.2);
    cabin.castShadow = true;
    root.add(cabin);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.22, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    [
      { x: -0.9, z: 1.2 },
      { x: 0.9, z: 1.2 },
      { x: -0.9, z: -1.2 },
      { x: 0.9, z: -1.2 },
    ].forEach((pos) => {
      const w = new THREE.Mesh(wheelGeo, tireMat);
      w.position.set(pos.x, 0.35, pos.z);
      w.castShadow = true;
      root.add(w);
    });

    return root;
  }

  public update(delta: number, playerPos: THREE.Vector3): { collided: boolean; vehicleType?: string } {
    let playerCollision = false;
    let collidedType: string | undefined;

    for (const v of this.vehicles) {
      const step = v.speed * delta;

      if (v.lane === 'north') {
        v.position.z += step;
        if (v.position.z > 200) v.position.z = -200;
      } else if (v.lane === 'south') {
        v.position.z -= step;
        if (v.position.z < -200) v.position.z = 200;
      } else if (v.lane === 'east') {
        v.position.x += step;
        if (v.position.x > 200) v.position.x = -200;
      } else if (v.lane === 'west') {
        v.position.x -= step;
        if (v.position.x < -200) v.position.x = 200;
      }

      v.mesh.position.copy(v.position);

      // Check collision with player
      const dist = v.position.distanceTo(playerPos);
      if (dist < v.boundingRadius + 1.2) {
        playerCollision = true;
        collidedType = v.type;
      }
    }

    return { collided: playerCollision, vehicleType: collidedType };
  }
}
