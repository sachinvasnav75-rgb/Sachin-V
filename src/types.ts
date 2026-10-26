/**
 * Super Bike India 3D - Types & Data Models
 */

export type VehicleId = 
  | 'hayabusa' 
  | 'duke390' 
  | 'bullet350' 
  | 'ninja_h2' 
  | 'pulsar220' 
  | 'rickshaw' 
  | 'thar4x4';

export interface VehicleConfig {
  id: VehicleId;
  name: string;
  category: 'superbike' | 'street' | 'cruiser' | 'hypersport' | 'classic' | 'special';
  description: string;
  maxSpeed: number; // km/h
  acceleration: number; // 0-100 rating
  handling: number; // turning agility
  braking: number;
  engineSound: 'inline4' | 'single_thump' | 'supercharged' | 'twin' | 'twostroke';
  weight: number; // kg
  wheelbase: number;
  gears: number;
  gearRatios: number[];
  price: number;
  isUnlocked: boolean;
  baseColor: string;
  accentColor: string;
  neonColor?: string;
  exhaustType: 'stock' | 'sc_project' | 'akrapovic' | 'freeflow';
}

export interface CustomizationState {
  color: string;
  accentColor: string;
  neonColor: string;
  neonEnabled: boolean;
  exhaust: 'stock' | 'sc_project' | 'akrapovic' | 'freeflow';
  engineStage: number; // 1 to 3
  wheelColor: string;
  turboUnlocked: boolean;
}

export type CameraMode = 'third_person' | 'first_person' | 'cinematic' | 'wheel_cam';

export type WeatherType = 'sunny' | 'golden_hour' | 'night' | 'rainy';

export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  category: 'speed' | 'stunt' | 'delivery' | 'checkpoint' | 'drift';
  description: string;
  targetMetric: number;
  timeLimit?: number; // seconds
  rewardCoins: number;
  targetLocation?: { x: number; z: number };
  completed: boolean;
}

export interface StuntScoreEvent {
  id: string;
  title: string;
  points: number;
  multiplier: number;
  timestamp: number;
}

export interface CheatCode {
  code: string;
  title: string;
  effect: string;
  category: 'vehicle' | 'physics' | 'environment' | 'special';
}

export interface PlayerStats {
  coins: number;
  reputation: number;
  topSpeedRecord: number;
  longestWheelieDist: number;
  highestJumpDist: number;
  totalDistanceRidden: number;
  stuntsPerformed: number;
  missionsCompleted: number;
}
