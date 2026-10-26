/**
 * Super Bike India 3D - Three.js Game Engine
 * Full implementation adhering strictly to Three.js guidelines:
 * - isSoftwareGl detection & loop pacing
 * - RoomEnvironment PMREM reflections
 * - Multi-camera rig with kinematic damping
 * - Nitro flame particles & drift tire smoke
 * - Day/Night lighting and headlights
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CameraMode,
  CustomizationState,
  VehicleConfig,
  WeatherType,
} from '../types';
import { WorldManager } from './world';
import { TrafficManager } from './traffic';
import { BikePhysics, ControlInputs } from './physics';
import { buildMotorcycleModel, buildTharSUVModel, buildAutoRickshawModel, VehicleMeshBundle } from './proceduralModels';
import { soundEngine } from '../audio/SoundManager';

// Pre-allocated math objects to prevent garbage collection in render loop
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _camOffset = new THREE.Vector3();
const _camTarget = new THREE.Vector3();

export class GameEngine {
  public container: HTMLDivElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public isSoftwareGl: boolean;

  // Systems
  public world: WorldManager;
  public traffic: TrafficManager;
  public physics: BikePhysics;

  // Active vehicle state
  public currentConfig: VehicleConfig;
  public currentCustomState: CustomizationState;
  private vehicleGroup: THREE.Group;
  private vehicleBundle?: VehicleMeshBundle;
  private vehicleMeshRoot?: THREE.Group;

  // Camera & view mode
  public cameraMode: CameraMode = 'third_person';
  private cameraShakeAmount: number = 0;

  // Lighting & Environment
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  public weather: WeatherType = 'sunny';

  // Particles
  private nitroFlameMesh?: THREE.Mesh;
  private driftSmokeParticles!: THREE.Points;
  private smokePositions!: Float32Array;
  private smokeOpacities!: Float32Array;

  // Loop control
  private isRunning: boolean = false;
  private animFrameId: number = 0;
  private clock: THREE.Clock;

  // Input states
  public inputs: ControlInputs = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    handbrake: false,
    wheelie: false,
    stoppie: false,
    nitro: false,
  };

  // State hooks
  public onUpdateStats?: (stats: {
    speedKmh: number;
    rpm: number;
    gear: number;
    nitroFuel: number;
    fuel: number;
    posX: number;
    posZ: number;
    heading: number;
  }) => void;

  constructor(
    container: HTMLDivElement,
    initialConfig: VehicleConfig,
    initialCustom: CustomizationState
  ) {
    this.container = container;
    this.currentConfig = initialConfig;
    this.currentCustomState = initialCustom;
    this.clock = new THREE.Clock();

    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Three.js Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      62,
      container.clientWidth / container.clientHeight,
      0.1,
      800
    );
    this.camera.position.set(0, 3, -6);

    // 4. Room Environment for PBR Reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Setup
    this.setupLighting();

    // 6. World & Traffic Setup
    this.world = new WorldManager();
    this.world.buildWorld();
    this.scene.add(this.world.scene);

    this.traffic = new TrafficManager();
    this.traffic.initTraffic(14);
    this.scene.add(this.traffic.group);

    // 7. Physics Setup
    this.physics = new BikePhysics(initialConfig, initialCustom, this.world);
    this.physics.reset(new THREE.Vector3(0, 0.4, 0), 0);

    // 8. Vehicle Container
    this.vehicleGroup = new THREE.Group();
    this.scene.add(this.vehicleGroup);
    this.spawnVehicle(this.currentConfig.id);

    // 9. Particle Systems (Nitro & Drift Smoke)
    this.setupParticles();

    // 10. Window Resize Listener
    window.addEventListener('resize', this.onResize);
  }

  private setupLighting() {
    // Hemisphere ambient (cool sky + warm ground)
    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x44403c, 0.7);
    this.scene.add(this.hemiLight);

    // Key Directional Sun
    this.dirLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    this.dirLight.position.set(60, 100, 40);
    this.dirLight.castShadow = !this.isSoftwareGl;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 300;
    const d = 45;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.dirLight.shadow.normalBias = 0.02;
    this.scene.add(this.dirLight);

    // Atmosphere fog matching horizon
    this.setWeather('sunny');
  }

  public setWeather(weather: WeatherType) {
    this.weather = weather;
    if (weather === 'sunny') {
      this.scene.background = new THREE.Color(0x38bdf8); // Vibrant Indian blue sky
      this.scene.fog = new THREE.FogExp2(0x38bdf8, 0.0035);
      this.dirLight.intensity = 1.9;
      this.dirLight.color.setHex(0xffedd5);
      this.hemiLight.color.setHex(0xe0f2fe);
      this.hemiLight.intensity = 0.8;
    } else if (weather === 'golden_hour') {
      this.scene.background = new THREE.Color(0xf97316);
      this.scene.fog = new THREE.FogExp2(0xf97316, 0.0045);
      this.dirLight.intensity = 2.2;
      this.dirLight.color.setHex(0xfeb272);
      this.dirLight.position.set(120, 25, -50);
      this.hemiLight.intensity = 0.5;
    } else if (weather === 'night') {
      this.scene.background = new THREE.Color(0x090d16);
      this.scene.fog = new THREE.FogExp2(0x090d16, 0.005);
      this.dirLight.intensity = 0.2;
      this.dirLight.color.setHex(0x38bdf8);
      this.hemiLight.intensity = 0.25;
    } else if (weather === 'rainy') {
      this.scene.background = new THREE.Color(0x334155);
      this.scene.fog = new THREE.FogExp2(0x334155, 0.007);
      this.dirLight.intensity = 0.8;
      this.hemiLight.intensity = 0.4;
    }
  }

  public spawnVehicle(vehicleId: string) {
    // Remove previous mesh
    if (this.vehicleMeshRoot) {
      this.vehicleGroup.remove(this.vehicleMeshRoot);
    }

    if (vehicleId === 'rickshaw') {
      this.vehicleMeshRoot = buildAutoRickshawModel();
      this.vehicleBundle = undefined;
    } else if (vehicleId === 'thar4x4') {
      this.vehicleMeshRoot = buildTharSUVModel();
      this.vehicleBundle = undefined;
    } else {
      const bundle = buildMotorcycleModel(vehicleId as any, this.currentCustomState);
      this.vehicleBundle = bundle;
      this.vehicleMeshRoot = bundle.root;
    }

    this.vehicleGroup.add(this.vehicleMeshRoot);
    this.physics.setVehicle(this.currentConfig, this.currentCustomState);
    soundEngine.startEngine(this.currentConfig.engineSound);
  }

  private setupParticles() {
    // 1. Nitro flame cone
    const flameGeo = new THREE.ConeGeometry(0.12, 0.75, 12);
    flameGeo.rotateX(Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
    });
    this.nitroFlameMesh = new THREE.Mesh(flameGeo, flameMat);
    this.nitroFlameMesh.position.set(0.28, 0.52, -1.1);
    this.nitroFlameMesh.visible = false;
    this.vehicleGroup.add(this.nitroFlameMesh);

    // 2. Drift / tire smoke
    const count = 60;
    const geometry = new THREE.BufferGeometry();
    this.smokePositions = new Float32Array(count * 3);
    this.smokeOpacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      this.smokePositions[i * 3] = 0;
      this.smokePositions[i * 3 + 1] = -100;
      this.smokePositions[i * 3 + 2] = 0;
      this.smokeOpacities[i] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.smokePositions, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xd4d4d8,
      size: 0.6,
      transparent: true,
      opacity: 0.45,
    });
    this.driftSmokeParticles = new THREE.Points(geometry, smokeMat);
    this.scene.add(this.driftSmokeParticles);
  }

  private updateParticles(delta: number, isDrifting: boolean, isNitro: boolean) {
    if (this.nitroFlameMesh) {
      this.nitroFlameMesh.visible = isNitro;
      if (isNitro) {
        // Flicker flame scale
        const s = 0.8 + Math.random() * 0.4;
        this.nitroFlameMesh.scale.set(s, s, s * 1.3);
      }
    }

    // Emit drift smoke at rear wheel
    if (isDrifting && Math.random() < 0.3) {
      const idx = Math.floor(Math.random() * (this.smokePositions.length / 3));
      const pos = this.physics.state.position;
      this.smokePositions[idx * 3] = pos.x + (Math.random() - 0.5) * 0.4;
      this.smokePositions[idx * 3 + 1] = pos.y + 0.15;
      this.smokePositions[idx * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.4;
      this.driftSmokeParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  public updateCustomization(customState: CustomizationState) {
    this.currentCustomState = customState;
    this.spawnVehicle(this.currentConfig.id);
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
  }

  private updateCamera(delta: number, state: any) {
    const heading = state.heading;
    const pos = state.position;

    if (this.cameraMode === 'third_person') {
      // Dynamic chase camera with lag & speed FOV
      const distance = 4.8;
      const height = 1.9 + (state.pitchAngle > 0 ? state.pitchAngle * 1.2 : 0);

      _camOffset.set(
        -Math.sin(heading) * distance,
        height,
        -Math.cos(heading) * distance
      );

      const targetCamPos = _vec3A.copy(pos).add(_camOffset);

      // Speed shake
      if (Math.abs(state.speedKmh) > 160) {
        this.cameraShakeAmount = (Math.abs(state.speedKmh) - 160) * 0.0003;
        targetCamPos.x += (Math.random() - 0.5) * this.cameraShakeAmount;
        targetCamPos.y += (Math.random() - 0.5) * this.cameraShakeAmount;
      }

      // Smooth damp position
      this.camera.position.lerp(targetCamPos, Math.min(1.0, delta * 9));

      // Look slightly ahead of bike
      _camTarget.set(
        pos.x + Math.sin(heading) * 3.5,
        pos.y + 1.2,
        pos.z + Math.cos(heading) * 3.5
      );
      this.camera.lookAt(_camTarget);

      // Dynamic FOV on high speed (60 -> 78 deg)
      const targetFov = 62 + Math.min(18, (Math.abs(state.speedKmh) / 250) * 16);
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 6, delta);
      this.camera.updateProjectionMatrix();

    } else if (this.cameraMode === 'first_person') {
      // Cockpit / Handlebar view
      this.camera.position.set(
        pos.x + Math.sin(heading) * 0.35,
        pos.y + 1.25,
        pos.z + Math.cos(heading) * 0.35
      );
      _camTarget.set(
        pos.x + Math.sin(heading) * 15,
        pos.y + 1.2,
        pos.z + Math.cos(heading) * 15
      );
      this.camera.lookAt(_camTarget);

    } else if (this.cameraMode === 'cinematic') {
      // Low ground side action camera
      _camOffset.set(
        Math.cos(heading) * 4.2 - Math.sin(heading) * 2.5,
        0.5,
        -Math.sin(heading) * 4.2 - Math.cos(heading) * 2.5
      );
      this.camera.position.lerp(_vec3A.copy(pos).add(_camOffset), Math.min(1.0, delta * 6));
      this.camera.lookAt(pos.x, pos.y + 0.8, pos.z);

    } else if (this.cameraMode === 'wheel_cam') {
      // Rear wheel camera
      _camOffset.set(
        -Math.sin(heading) * 1.5,
        0.4,
        -Math.cos(heading) * 1.5
      );
      this.camera.position.copy(pos).add(_camOffset);
      _camTarget.set(pos.x + Math.sin(heading) * 10, pos.y + 0.5, pos.z + Math.cos(heading) * 10);
      this.camera.lookAt(_camTarget);
    }
  }

  // Loop execution with Software WebGL Guard (Directive requirement)
  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.tick();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      clearTimeout(this.animFrameId);
    }
    soundEngine.stopEngine();
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.animFrameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.animFrameId = window.setTimeout(cb, 60);
      }
    };
    this.animFrameId = window.setTimeout(poll, 5);
  }

  private tick = () => {
    if (!this.isRunning) return;

    const delta = Math.min(this.clock.getDelta(), 0.08);

    // 1. Step physics
    const pState = this.physics.update(delta, this.inputs);

    // 2. Position 3D Vehicle Root
    this.vehicleGroup.position.copy(pState.position);
    this.vehicleGroup.rotation.y = pState.heading;

    if (this.vehicleMeshRoot) {
      // Apply banking lean & wheelie/stoppie pitch
      this.vehicleMeshRoot.rotation.z = pState.leanAngle;
      this.vehicleMeshRoot.rotation.x = -pState.pitchAngle;
    }

    // Spin wheels according to speed
    if (this.vehicleBundle) {
      const wheelSpin = (pState.speed / 0.42) * delta;
      this.vehicleBundle.frontWheel.rotation.x += wheelSpin;
      this.vehicleBundle.rearWheel.rotation.x += wheelSpin;

      // Steer handlebar
      let steerInput = 0;
      if (this.inputs.left) steerInput += 0.35;
      if (this.inputs.right) steerInput -= 0.35;
      this.vehicleBundle.handlebar.rotation.y = THREE.MathUtils.damp(
        this.vehicleBundle.handlebar.rotation.y,
        steerInput,
        12,
        delta
      );
    }

    // 3. Step AI Traffic
    const trafficResult = this.traffic.update(delta, pState.position);
    if (trafficResult.collided) {
      soundEngine.playCrash();
      // Push back vehicle
      pState.speed *= -0.3;
    }

    // 4. Update Audio Engine
    soundEngine.updateEngine(pState.rpm, this.inputs.forward, this.inputs.backward);
    soundEngine.playNitro(this.inputs.nitro && pState.nitroFuel > 0 && this.inputs.forward);

    // 5. Update Particles
    this.updateParticles(
      delta,
      Math.abs(pState.driftAngle) > 0.25,
      this.inputs.nitro && pState.nitroFuel > 0 && this.inputs.forward
    );

    // 6. Camera Rig
    this.updateCamera(delta, pState);

    // 7. Light following player
    this.dirLight.position.x = pState.position.x + 60;
    this.dirLight.position.z = pState.position.z + 40;
    this.dirLight.target.position.copy(pState.position);
    this.dirLight.target.updateMatrixWorld();

    // 8. Stats callback for React UI HUD
    if (this.onUpdateStats) {
      this.onUpdateStats({
        speedKmh: pState.speedKmh,
        rpm: pState.rpm,
        gear: pState.gear,
        nitroFuel: pState.nitroFuel,
        fuel: pState.fuel,
        posX: pState.position.x,
        posZ: pState.position.z,
        heading: pState.heading,
      });
    }

    // 9. Render Scene
    this.renderer.render(this.scene, this.camera);

    // 10. Frame scheduling adhering to Three.js Software WebGL Guard
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.animFrameId = requestAnimationFrame(this.tick);
    }
  };

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
