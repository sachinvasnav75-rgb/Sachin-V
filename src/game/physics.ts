/**
 * Super Bike India 3D - Motorcycle Dynamics & Stunt Physics
 * Arcade-realistic motorcycle kinematics:
 * Lean banking, wheelie/stoppie pitch, airtime jump physics, drifting, and collision handling.
 */

import * as THREE from 'three';
import { VehicleConfig, CustomizationState } from '../types';
import { WorldManager } from './world';

export interface ControlInputs {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  handbrake: boolean;
  wheelie: boolean;
  stoppie: boolean;
  nitro: boolean;
}

export interface PhysicsState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  heading: number; // yaw angle in radians
  speed: number; // forward speed in m/s
  speedKmh: number;
  rpm: number; // 0 to 1
  gear: number;
  leanAngle: number; // roll angle in radians (banking)
  pitchAngle: number; // wheelie / stoppie / jump pitch
  isGrounded: boolean;
  inAirTime: number;
  jumpStartHeight: number;
  wheelieTime: number;
  wheelieDist: number;
  driftAngle: number;
  nitroFuel: number; // 0 to 100
  fuel: number; // 0 to 100
}

export class BikePhysics {
  public state: PhysicsState;
  public config: VehicleConfig;
  public customState: CustomizationState;
  public world: WorldManager;

  // Stunt callbacks
  public onStuntTrigger?: (title: string, points: number) => void;
  public onCrash?: () => void;

  private airRotationY: number = 0;
  private airFlipX: number = 0;
  private lastStuntTime: number = 0;

  constructor(config: VehicleConfig, customState: CustomizationState, world: WorldManager) {
    this.config = config;
    this.customState = customState;
    this.world = world;

    this.state = {
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      heading: 0,
      speed: 0,
      speedKmh: 0,
      rpm: 0.1,
      gear: 1,
      leanAngle: 0,
      pitchAngle: 0,
      isGrounded: true,
      inAirTime: 0,
      jumpStartHeight: 0,
      wheelieTime: 0,
      wheelieDist: 0,
      driftAngle: 0,
      nitroFuel: 100,
      fuel: 100,
    };
  }

  public setVehicle(config: VehicleConfig, customState: CustomizationState) {
    this.config = config;
    this.customState = customState;
  }

  public reset(position = new THREE.Vector3(0, 0, 0), heading = 0) {
    this.state.position.copy(position);
    this.state.velocity.set(0, 0, 0);
    this.state.heading = heading;
    this.state.speed = 0;
    this.state.speedKmh = 0;
    this.state.rpm = 0.1;
    this.state.gear = 1;
    this.state.leanAngle = 0;
    this.state.pitchAngle = 0;
    this.state.isGrounded = true;
    this.state.inAirTime = 0;
    this.state.wheelieTime = 0;
    this.state.wheelieDist = 0;
  }

  public update(delta: number, inputs: ControlInputs): PhysicsState {
    const s = this.state;
    const stageMultiplier = 1.0 + (this.customState.engineStage - 1) * 0.15;
    const maxSpeedMs = (this.config.maxSpeed * stageMultiplier) / 3.6;

    // Nitro boost
    let isNitroActive = false;
    if (inputs.nitro && s.nitroFuel > 0 && inputs.forward) {
      isNitroActive = true;
      s.nitroFuel = Math.max(0, s.nitroFuel - delta * 25);
    } else {
      s.nitroFuel = Math.min(100, s.nitroFuel + delta * 6);
    }

    // Fuel consumption
    if (inputs.forward) {
      s.fuel = Math.max(5, s.fuel - delta * 0.25);
    }

    // Check ground elevation
    const groundY = this.world.getGroundHeight(s.position.x, s.position.z);
    const heightAboveGround = s.position.y - groundY;

    if (heightAboveGround <= 0.08) {
      // Grounded
      if (!s.isGrounded && s.inAirTime > 0.4) {
        // Landing from jump!
        const airScore = Math.floor(s.inAirTime * 450);
        if (airScore > 100 && this.onStuntTrigger) {
          const title = s.inAirTime > 1.2 ? '🔥 INSANE AIR TIME!' : '⚡ CLEAN JUMP!';
          this.onStuntTrigger(title, airScore);
        }
      }

      s.isGrounded = true;
      s.position.y = groundY;
      s.velocity.y = 0;
      s.inAirTime = 0;
    } else {
      // Airborne
      s.isGrounded = false;
      s.inAirTime += delta;
      s.velocity.y -= 19.6 * delta; // Gravity
      s.position.y += s.velocity.y * delta;
    }

    // ACCELERATION & BRAKING
    const accelRate = (this.config.acceleration / 10) * 8.5 * stageMultiplier * (isNitroActive ? 1.6 : 1.0);
    const brakeRate = 22.0;
    const coastFriction = 3.5;

    if (s.isGrounded) {
      if (inputs.forward) {
        s.speed = Math.min(s.speed + accelRate * delta, maxSpeedMs * (isNitroActive ? 1.25 : 1.0));
      } else if (inputs.backward) {
        if (s.speed > 0.5) {
          s.speed = Math.max(0, s.speed - brakeRate * delta);
        } else {
          s.speed = Math.max(-10, s.speed - accelRate * 0.5 * delta); // Reverse
        }
      } else {
        // Coasting friction
        if (s.speed > 0) s.speed = Math.max(0, s.speed - coastFriction * delta);
        else if (s.speed < 0) s.speed = Math.min(0, s.speed + coastFriction * delta);
      }

      // Handbrake drift
      if (inputs.handbrake && Math.abs(s.speed) > 5) {
        s.speed = Math.max(0, s.speed - brakeRate * 1.5 * delta);
        s.driftAngle = THREE.MathUtils.damp(s.driftAngle, inputs.left ? 0.6 : (inputs.right ? -0.6 : 0), 6, delta);
        
        // Trigger drift stunt score
        const now = performance.now();
        if (Math.abs(s.driftAngle) > 0.3 && now - this.lastStuntTime > 1200) {
          this.lastStuntTime = now;
          if (this.onStuntTrigger) this.onStuntTrigger('💨 INDIAN DRIFT KING!', 250);
        }
      } else {
        s.driftAngle = THREE.MathUtils.damp(s.driftAngle, 0, 8, delta);
      }
    }

    // STEERING & LEAN ANGLE
    let steerInput = 0;
    if (inputs.left) steerInput += 1;
    if (inputs.right) steerInput -= 1;

    const speedRatio = Math.min(1.0, Math.abs(s.speed) / 25);
    const steerSpeed = (this.config.handling / 10) * 1.8 * (1.1 - speedRatio * 0.45);

    if (s.isGrounded && Math.abs(s.speed) > 0.2) {
      const dir = s.speed >= 0 ? 1 : -1;
      s.heading += steerInput * steerSpeed * dir * delta;

      // Target lean banking angle: up to ~38 degrees (0.66 rad)
      const targetLean = steerInput * -0.55 * Math.min(1.0, Math.abs(s.speed) / 12);
      s.leanAngle = THREE.MathUtils.damp(s.leanAngle, targetLean, 8, delta);
    } else if (!s.isGrounded) {
      // Air control: slow spin
      s.heading += steerInput * 1.2 * delta;
      s.leanAngle = THREE.MathUtils.damp(s.leanAngle, 0, 4, delta);
    } else {
      s.leanAngle = THREE.MathUtils.damp(s.leanAngle, 0, 10, delta);
    }

    // WHEELIE & STOPPIE
    if (s.isGrounded) {
      if (inputs.wheelie && s.speed > 4) {
        s.pitchAngle = THREE.MathUtils.damp(s.pitchAngle, 0.65, 5, delta); // ~37 degrees front wheel lift
        s.wheelieTime += delta;
        s.wheelieDist += s.speed * delta;

        if (s.wheelieTime > 1.5 && Math.random() < 0.05) {
          if (this.onStuntTrigger) this.onStuntTrigger('🚀 MONSTER WHEELIE!', Math.floor(s.wheelieDist * 10));
        }
      } else if (inputs.stoppie && s.speed > 8) {
        s.pitchAngle = THREE.MathUtils.damp(s.pitchAngle, -0.45, 6, delta); // Rear wheel lift
      } else {
        s.pitchAngle = THREE.MathUtils.damp(s.pitchAngle, 0, 10, delta);
        s.wheelieTime = 0;
      }
    }

    // MOVE POSITION
    const moveHeading = s.heading + s.driftAngle;
    s.position.x += Math.sin(moveHeading) * s.speed * delta;
    s.position.z += Math.cos(moveHeading) * s.speed * delta;

    // Boundary clamp: perimeter bounds within -250 to 250
    const maxBound = 255;
    if (Math.abs(s.position.x) > maxBound || Math.abs(s.position.z) > maxBound) {
      s.speed = -s.speed * 0.4; // Bounce off perimeter hills
      s.position.x = THREE.MathUtils.clamp(s.position.x, -maxBound, maxBound);
      s.position.z = THREE.MathUtils.clamp(s.position.z, -maxBound, maxBound);
      if (this.onCrash) this.onCrash();
    }

    // DERIVE KM/H & RPM & GEAR
    s.speedKmh = Math.round(s.speed * 3.6);
    const kmhAbs = Math.abs(s.speedKmh);

    if (kmhAbs < 40) s.gear = 1;
    else if (kmhAbs < 75) s.gear = 2;
    else if (kmhAbs < 115) s.gear = 3;
    else if (kmhAbs < 160) s.gear = 4;
    else if (kmhAbs < 210) s.gear = 5;
    else s.gear = 6;

    // RPM based on speed within gear
    const gearBaseSpeed = (s.gear - 1) * 35;
    const gearFraction = Math.min(1.0, Math.max(0.15, (kmhAbs - gearBaseSpeed) / 45));
    s.rpm = THREE.MathUtils.damp(s.rpm, gearFraction, 10, delta);

    return s;
  }
}
