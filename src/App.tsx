/**
 * Super Bike India 3D: Open World
 * Master Application Coordinator
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GameEngine } from './game/GameEngine';
import { HUD } from './components/HUD';
import { PhoneModal } from './components/PhoneModal';
import { GarageModal } from './components/GarageModal';
import { MissionsModal } from './components/MissionsModal';
import { SettingsModal } from './components/SettingsModal';
import { MainMenu } from './components/MainMenu';
import {
  CameraMode,
  CustomizationState,
  Mission,
  PlayerStats,
  StuntScoreEvent,
  VehicleConfig,
  VehicleId,
  WeatherType,
} from './types';
import { VEHICLE_CATALOG } from './data/vehicles';
import { CAREER_MISSIONS } from './data/missions';
import { soundEngine } from './audio/SoundManager';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'super_bike_india_save_v1';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game UI State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState<boolean>(false);
  const [isGarageOpen, setIsGarageOpen] = useState<boolean>(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Player State & Persistence
  const [currentVehicleId, setCurrentVehicleId] = useState<VehicleId>('hayabusa');
  const [unlockedVehicles, setUnlockedVehicles] = useState<VehicleId[]>([
    'hayabusa',
    'duke390',
    'bullet350',
    'rickshaw',
  ]);
  const [customState, setCustomState] = useState<CustomizationState>({
    color: '#ea580c',
    accentColor: '#18181b',
    neonColor: '#06b6d4',
    neonEnabled: false,
    exhaust: 'sc_project',
    engineStage: 1,
    wheelColor: '#18181b',
    turboUnlocked: false,
  });

  const [stats, setStats] = useState<PlayerStats>({
    coins: 5000,
    reputation: 100,
    topSpeedRecord: 0,
    longestWheelieDist: 0,
    highestJumpDist: 0,
    totalDistanceRidden: 0,
    stuntsPerformed: 0,
    missionsCompleted: 0,
  });

  const [missions, setMissions] = useState<Mission[]>(CAREER_MISSIONS);
  const [activeMissionId, setActiveMissionId] = useState<string | undefined>();

  // Realtime Live Telemetry for HUD
  const [hudStats, setHudStats] = useState({
    speedKmh: 0,
    rpm: 0.1,
    gear: 1,
    nitroFuel: 100,
    fuel: 100,
    posX: 0,
    posZ: 0,
    heading: 0,
  });

  const [cameraMode, setCameraMode] = useState<CameraMode>('third_person');
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [graphicsPreset, setGraphicsPreset] = useState<'low' | 'medium' | 'high'>('high');
  const [soundVolume, setSoundVolume] = useState<number>(0.8);
  const [sensitivity, setSensitivity] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [stuntEvent, setStuntEvent] = useState<StuntScoreEvent | null>(null);

  // Load saved progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.coins !== undefined) {
          setStats((prev) => ({ ...prev, ...parsed.stats }));
          if (parsed.unlockedVehicles) setUnlockedVehicles(parsed.unlockedVehicles);
          if (parsed.currentVehicleId) setCurrentVehicleId(parsed.currentVehicleId);
          if (parsed.customState) setCustomState(parsed.customState);
        }
      }
    } catch {}
  }, []);

  // Save progress
  const saveProgress = useCallback((newStats: PlayerStats, unlocked: VehicleId[], vId: VehicleId, custom: CustomizationState) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          stats: newStats,
          unlockedVehicles: unlocked,
          currentVehicleId: vId,
          customState: custom,
        })
      );
    } catch {}
  }, []);

  // Initialize Three.js Engine once on mount
  useEffect(() => {
    if (!canvasMountRef.current || engineRef.current) return;

    const initialConfig = VEHICLE_CATALOG.find((v) => v.id === currentVehicleId) || VEHICLE_CATALOG[0];
    const engine = new GameEngine(canvasMountRef.current, initialConfig, customState);
    engineRef.current = engine;

    // Connect stats telemetry
    engine.onUpdateStats = (newTelemetry) => {
      setHudStats(newTelemetry);

      // Track top speed record
      if (Math.abs(newTelemetry.speedKmh) > stats.topSpeedRecord) {
        setStats((prev) => ({ ...prev, topSpeedRecord: Math.abs(newTelemetry.speedKmh) }));
      }
    };

    // Connect Stunt detection
    engine.physics.onStuntTrigger = (title, points) => {
      soundEngine.playStuntSuccess();
      const event: StuntScoreEvent = {
        id: Math.random().toString(),
        title,
        points,
        multiplier: 1,
        timestamp: Date.now(),
      };
      setStuntEvent(event);
      setTimeout(() => setStuntEvent(null), 1800);

      // Award coins
      setStats((prev) => {
        const updated = {
          ...prev,
          coins: prev.coins + points,
          stuntsPerformed: prev.stuntsPerformed + 1,
        };
        saveProgress(updated, unlockedVehicles, currentVehicleId, customState);
        return updated;
      });
    };

    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      soundEngine.resume();
      const engine = engineRef.current;
      if (!engine) return;

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') engine.inputs.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') engine.inputs.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') engine.inputs.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') engine.inputs.right = true;
      if (code === 'Space') {
        e.preventDefault();
        engine.inputs.wheelie = true;
      }
      if (code === 'ShiftLeft' || code === 'ShiftRight') engine.inputs.nitro = true;
      if (code === 'KeyQ') engine.inputs.stoppie = true;
      if (code === 'KeyH') {
        soundEngine.playHorn('indian_pom');
      }
      if (code === 'KeyC') {
        cycleCamera();
      }
      if (code === 'KeyP') {
        setIsPhoneOpen((prev) => !prev);
      }
      if (code === 'KeyG') {
        setIsGarageOpen((prev) => !prev);
      }
      if (code === 'KeyM') {
        setIsMissionsOpen((prev) => !prev);
      }
      if (code === 'KeyR') {
        engine.physics.reset(new THREE.Vector3(0, 0.4, 0), 0);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') engine.inputs.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') engine.inputs.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') engine.inputs.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') engine.inputs.right = false;
      if (code === 'Space') engine.inputs.wheelie = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') engine.inputs.nitro = false;
      if (code === 'KeyQ') engine.inputs.stoppie = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch screen input forwarder
  const handleTouchInput = (action: string, isPressed: boolean) => {
    soundEngine.resume();
    const engine = engineRef.current;
    if (!engine) return;

    if (action === 'forward') engine.inputs.forward = isPressed;
    if (action === 'backward') engine.inputs.backward = isPressed;
    if (action === 'left') engine.inputs.left = isPressed;
    if (action === 'right') engine.inputs.right = isPressed;
    if (action === 'wheelie') engine.inputs.wheelie = isPressed;
    if (action === 'nitro') engine.inputs.nitro = isPressed;
  };

  // Camera cycle
  const cycleCamera = () => {
    const modes: CameraMode[] = ['third_person', 'first_person', 'cinematic', 'wheel_cam'];
    const nextIdx = (modes.indexOf(cameraMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setCameraMode(nextMode);
    engineRef.current?.setCameraMode(nextMode);
  };

  // Horn trigger
  const handleTriggerHorn = () => {
    soundEngine.playHorn('indian_pom');
  };

  // Reset vehicle to center road
  const handleResetVehicle = () => {
    engineRef.current?.physics.reset(new THREE.Vector3(0, 0.4, 0), 0);
  };

  // In-Game Phone Cheat Executor
  const handleExecuteCheat = (code: string): { success: boolean; message: string } => {
    const engine = engineRef.current;
    if (!engine) return { success: false, message: 'Game not ready' };

    if (code === '1111') {
      selectVehicle('hayabusa');
      return { success: true, message: '🏍️ SPAWNED HAYABUSA 1300R!' };
    }
    if (code === '2222') {
      selectVehicle('duke390');
      return { success: true, message: '🏍️ SPAWNED KTM DUKE 390!' };
    }
    if (code === '3333') {
      selectVehicle('bullet350');
      return { success: true, message: '🏍️ SPAWNED ROYAL BULLET 350!' };
    }
    if (code === '4444') {
      if (!unlockedVehicles.includes('ninja_h2')) {
        setUnlockedVehicles((prev) => [...prev, 'ninja_h2']);
      }
      selectVehicle('ninja_h2');
      return { success: true, message: '⚡ UNLOCKED & SPAWNED NINJA H2R!' };
    }
    if (code === '5555') {
      selectVehicle('rickshaw');
      return { success: true, message: '🛺 SPAWNED DESI AUTO RICKSHAW!' };
    }
    if (code === '6666') {
      if (!unlockedVehicles.includes('thar4x4')) {
        setUnlockedVehicles((prev) => [...prev, 'thar4x4']);
      }
      selectVehicle('thar4x4');
      return { success: true, message: '🚙 SPAWNED THAR 4x4 SUV!' };
    }
    if (code === '7777') {
      // Super Moon Jump
      engine.physics.state.velocity.y = 22;
      engine.physics.state.isGrounded = false;
      return { success: true, message: '🌕 SUPER JUMP ACTIVATED!' };
    }
    if (code === '8888') {
      // Unlimited Nitro
      engine.physics.state.nitroFuel = 100;
      return { success: true, message: '🚀 UNLIMITED NITRO BOOST REFILLED!' };
    }
    if (code === '0000') {
      // Full repair & gas
      engine.physics.state.fuel = 100;
      engine.physics.state.nitroFuel = 100;
      return { success: true, message: '🔧 VEHICLE REPAIRED & FULL FUEL!' };
    }
    if (code === '1234') {
      // Toggle weather
      const nextWeather = weather === 'sunny' ? 'golden_hour' : weather === 'golden_hour' ? 'night' : 'sunny';
      setWeather(nextWeather);
      engine.setWeather(nextWeather);
      return { success: true, message: `🌤️ WEATHER CHANGED TO: ${nextWeather.toUpperCase()}!` };
    }
    if (code === '9000') {
      // Teleport to mega ramp
      engine.physics.reset(new THREE.Vector3(140, 16, -140), 0);
      return { success: true, message: '🎪 TELEPORTED TO MEGA SKY RAMP!' };
    }

    return { success: false, message: '❌ INVALID CHEAT CODE' };
  };

  // Vehicle selection & unlock
  const selectVehicle = (id: VehicleId) => {
    setCurrentVehicleId(id);
    const cfg = VEHICLE_CATALOG.find((v) => v.id === id);
    if (cfg && engineRef.current) {
      engineRef.current.currentConfig = cfg;
      engineRef.current.spawnVehicle(id);
    }
  };

  const unlockVehicle = (id: VehicleId, cost: number) => {
    if (stats.coins >= cost && !unlockedVehicles.includes(id)) {
      const nextUnlocked = [...unlockedVehicles, id];
      const nextStats = { ...stats, coins: stats.coins - cost };
      setUnlockedVehicles(nextUnlocked);
      setStats(nextStats);
      saveProgress(nextStats, nextUnlocked, currentVehicleId, customState);
    }
  };

  const handleSaveCustom = (newCustom: CustomizationState) => {
    setCustomState(newCustom);
    engineRef.current?.updateCustomization(newCustom);
    saveProgress(stats, unlockedVehicles, currentVehicleId, newCustom);
  };

  // Career mission start
  const handleStartMission = (missionId: string) => {
    setActiveMissionId(missionId);
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    if (mission.targetLocation) {
      engineRef.current?.physics.reset(
        new THREE.Vector3(mission.targetLocation.x - 30, 0.4, mission.targetLocation.z - 30),
        0
      );
    }
  };

  // Check mission completion condition in tick
  useEffect(() => {
    if (!activeMissionId) return;
    const mission = missions.find((m) => m.id === activeMissionId);
    if (!mission || mission.completed) return;

    let isFinished = false;
    if (mission.category === 'speed' && Math.abs(hudStats.speedKmh) >= mission.targetMetric) {
      isFinished = true;
    }

    if (isFinished) {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      soundEngine.playStuntSuccess();
      setMissions((prev) =>
        prev.map((m) => (m.id === activeMissionId ? { ...m, completed: true } : m))
      );
      setStats((prev) => {
        const updated = {
          ...prev,
          coins: prev.coins + mission.rewardCoins,
          missionsCompleted: prev.missionsCompleted + 1,
        };
        saveProgress(updated, unlockedVehicles, currentVehicleId, customState);
        return updated;
      });
      setActiveMissionId(undefined);
    }
  }, [hudStats.speedKmh, activeMissionId, missions]);

  const activeMission = missions.find((m) => m.id === activeMissionId);
  const currentVehicleConfig = VEHICLE_CATALOG.find((v) => v.id === currentVehicleId) || VEHICLE_CATALOG[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans">
      
      {/* 1. THREE.JS CANVAS CONTAINER (Dedicated ref container per guidelines) */}
      <div 
        ref={canvasMountRef} 
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* 2. MAIN MENU (Lobby) */}
      {!isPlaying && (
        <MainMenu
          stats={stats}
          currentVehicle={currentVehicleConfig}
          onStartRide={() => {
            soundEngine.init();
            soundEngine.startEngine(currentVehicleConfig.engineSound);
            setIsPlaying(true);
          }}
          onOpenGarage={() => setIsGarageOpen(true)}
          onOpenMissions={() => setIsMissionsOpen(true)}
          onOpenPhone={() => setIsPhoneOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* 3. HEADS-UP DISPLAY (When in riding mode) */}
      {isPlaying && (
        <HUD
          speedKmh={hudStats.speedKmh}
          rpm={hudStats.rpm}
          gear={hudStats.gear}
          nitroFuel={hudStats.nitroFuel}
          fuel={hudStats.fuel}
          playerX={hudStats.posX}
          playerZ={hudStats.posZ}
          heading={hudStats.heading}
          cameraMode={cameraMode}
          stuntEvent={stuntEvent}
          activeMissionText={activeMission ? `${activeMission.title}: ${activeMission.subtitle}` : undefined}
          isMuted={isMuted}
          onToggleMute={() => {
            const muted = soundEngine.toggleMute();
            setIsMuted(muted);
          }}
          onOpenPhone={() => setIsPhoneOpen(true)}
          onOpenGarage={() => setIsGarageOpen(true)}
          onOpenMissions={() => setIsMissionsOpen(true)}
          onCycleCamera={cycleCamera}
          onResetVehicle={handleResetVehicle}
          onTriggerHorn={handleTriggerHorn}
          onTouchInput={handleTouchInput}
        />
      )}

      {/* 4. MODALS OVERLAYS */}
      <PhoneModal
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        onExecuteCheat={handleExecuteCheat}
      />

      <GarageModal
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        currentVehicleId={currentVehicleId}
        customState={customState}
        coins={stats.coins}
        unlockedVehicles={unlockedVehicles}
        onSelectVehicle={selectVehicle}
        onUnlockVehicle={unlockVehicle}
        onSaveCustomization={handleSaveCustom}
      />

      <MissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        missions={missions}
        activeMissionId={activeMissionId}
        onStartMission={handleStartMission}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        weather={weather}
        onChangeWeather={(w) => {
          setWeather(w);
          engineRef.current?.setWeather(w);
        }}
        graphicsPreset={graphicsPreset}
        onChangeGraphics={setGraphicsPreset}
        volume={soundVolume}
        onChangeVolume={(v) => {
          setSoundVolume(v);
          soundEngine.setVolume(v);
        }}
        sensitivity={sensitivity}
        onChangeSensitivity={setSensitivity}
      />
    </div>
  );
}
