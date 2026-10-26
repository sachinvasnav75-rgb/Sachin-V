/**
 * Super Bike India 3D - Heads-Up Display (HUD)
 * Speedometer, tachometer, gear, minimap, stunt banner, and collapsible control dock.
 */

import React, { useState } from 'react';
import {
  Phone,
  Wrench,
  Trophy,
  Camera,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  ChevronDown,
  ChevronUp,
  Compass,
  Zap,
} from 'lucide-react';
import { CameraMode, StuntScoreEvent } from '../types';
import { Minimap } from './Minimap';

interface HUDProps {
  speedKmh: number;
  rpm: number;
  gear: number;
  nitroFuel: number;
  fuel: number;
  playerX: number;
  playerZ: number;
  heading: number;
  cameraMode: CameraMode;
  stuntEvent: StuntScoreEvent | null;
  activeMissionText?: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenPhone: () => void;
  onOpenGarage: () => void;
  onOpenMissions: () => void;
  onCycleCamera: () => void;
  onResetVehicle: () => void;
  onTriggerHorn: () => void;
  // Touch / Mobile control handlers
  onTouchInput: (action: string, isPressed: boolean) => void;
}

export const HUD: React.FC<HUDProps> = ({
  speedKmh,
  rpm,
  gear,
  nitroFuel,
  fuel,
  playerX,
  playerZ,
  heading,
  cameraMode,
  stuntEvent,
  activeMissionText,
  isMuted,
  onToggleMute,
  onOpenPhone,
  onOpenGarage,
  onOpenMissions,
  onCycleCamera,
  onResetVehicle,
  onTriggerHorn,
  onTouchInput,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Speedometer needle angle (-120deg to 120deg)
  const maxDialSpeed = 340;
  const clampedSpeed = Math.min(maxDialSpeed, Math.abs(speedKmh));
  const needleAngle = -120 + (clampedSpeed / maxDialSpeed) * 240;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden">
      
      {/* -------------------------------------------------------------
          TOP BAR: Minimap, Active Mission, Quick Actions
         ------------------------------------------------------------- */}
      <div className="flex items-start justify-between w-full pointer-events-auto">
        
        {/* Left: Minimap Radar */}
        <div className="flex flex-col gap-2">
          <Minimap
            playerX={playerX}
            playerZ={playerZ}
            heading={heading}
            speedKmh={speedKmh}
          />

          {/* Active Mission Pill */}
          {activeMissionText && (
            <div className="px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold font-orbitron max-w-[200px] truncate shadow">
              🎯 {activeMissionText}
            </div>
          )}
        </div>

        {/* Center: Stunt Score Announcement Banner */}
        {stuntEvent && (
          <div className="animate-bounce flex flex-col items-center px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white border-2 border-amber-300 shadow-2xl">
            <span className="text-xs sm:text-sm font-black font-orbitron tracking-wider">
              {stuntEvent.title}
            </span>
            <span className="text-lg sm:text-xl font-black font-orbitron text-yellow-200">
              +{stuntEvent.points} PTS
            </span>
          </div>
        )}

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPhone}
            className="p-2.5 sm:px-3 sm:py-2 rounded-2xl bg-zinc-900/85 hover:bg-zinc-800 border border-orange-500/40 text-orange-400 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition"
            title="Open Phone Dialer (P)"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline font-orbitron">PHONE [P]</span>
          </button>

          <button
            onClick={onOpenGarage}
            className="p-2.5 sm:px-3 sm:py-2 rounded-2xl bg-zinc-900/85 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition"
            title="Garage & Customization (G)"
          >
            <Wrench className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline font-orbitron">GARAGE [G]</span>
          </button>

          <button
            onClick={onOpenMissions}
            className="p-2.5 sm:px-3 sm:py-2 rounded-2xl bg-zinc-900/85 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition"
            title="Missions (M)"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline font-orbitron">MISSIONS</span>
          </button>

          <button
            onClick={onCycleCamera}
            className="p-2.5 rounded-2xl bg-zinc-900/85 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 active:scale-95 transition shadow"
            title="Switch Camera (C)"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            onClick={onResetVehicle}
            className="p-2.5 rounded-2xl bg-zinc-900/85 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 active:scale-95 transition shadow"
            title="Reset Vehicle (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-2xl bg-zinc-900/85 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 active:scale-95 transition shadow"
            title="Audio Mute"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          BOTTOM COCKPIT HUD & COLLAPSIBLE CONTROL DOCK
          (Adheres to Three.js directive: unified collapsible bottom dock,
           zero left/right flank occlusion, cinema/zen mode support)
         ------------------------------------------------------------- */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center transition-all duration-300">
        
        {/* Collapse / Expand Cinema Toggle Button */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="pointer-events-auto px-4 py-1 mb-1 rounded-t-xl bg-zinc-900/80 hover:bg-zinc-800 border-t border-x border-orange-500/40 text-[11px] font-bold text-orange-400 font-orbitron uppercase tracking-wider flex items-center gap-1.5 transition shadow"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> SHOW COCKPIT HUD [H]
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> CINEMA MODE [H]
            </>
          )}
        </button>

        {/* Collapsible Dock Container */}
        {!isDockCollapsed && (
          <div className="w-full bg-zinc-950/85 border-2 border-orange-500/50 rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
            
            {/* 1. Mobile Steering Touch Controls (Left side) */}
            <div className="flex items-center gap-3">
              <button
                onPointerDown={() => onTouchInput('left', true)}
                onPointerUp={() => onTouchInput('left', false)}
                onPointerLeave={() => onTouchInput('left', false)}
                className="w-14 h-14 rounded-2xl bg-zinc-900/90 active:bg-orange-500 active:text-black border border-zinc-700 font-black text-xl flex items-center justify-center text-zinc-300 transition shadow"
              >
                ◀
              </button>

              <button
                onPointerDown={() => onTouchInput('right', true)}
                onPointerUp={() => onTouchInput('right', false)}
                onPointerLeave={() => onTouchInput('right', false)}
                className="w-14 h-14 rounded-2xl bg-zinc-900/90 active:bg-orange-500 active:text-black border border-zinc-700 font-black text-xl flex items-center justify-center text-zinc-300 transition shadow"
              >
                ▶
              </button>

              <button
                onClick={onTriggerHorn}
                className="w-12 h-12 rounded-2xl bg-amber-500/20 active:bg-amber-500 active:text-black border border-amber-500/40 font-bold text-xs flex flex-col items-center justify-center text-amber-400 transition shadow"
                title="Desi Pressure Horn (H)"
              >
                📢
                <span className="text-[9px] font-orbitron">HORN</span>
              </button>
            </div>

            {/* 2. Center Dial: High-Tech Digital Speedometer & Tachometer */}
            <div className="flex items-center gap-6">
              {/* Circular Speed Gauge */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Outer Ring */}
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="#27272a"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="#ea580c"
                    strokeWidth="8"
                    strokeDasharray={289}
                    strokeDashoffset={289 - (clampedSpeed / maxDialSpeed) * 289}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-75"
                  />
                </svg>

                {/* Digital Speed Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black font-orbitron text-white leading-none">
                    {Math.abs(speedKmh)}
                  </span>
                  <span className="text-[10px] font-bold font-orbitron text-orange-400 tracking-wider mt-0.5">
                    KM/H
                  </span>
                </div>
              </div>

              {/* Engine RPM & Gear Cluster */}
              <div className="flex flex-col justify-center gap-2">
                {/* Gear Badge */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-black font-black font-orbitron text-lg flex items-center justify-center shadow">
                    {Math.abs(speedKmh) < 1 ? 'N' : gear}
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase">GEAR</div>
                    <div className="text-xs font-orbitron text-white font-bold">
                      {Math.abs(speedKmh) < 1 ? 'NEUTRAL' : `GEAR ${gear}`}
                    </div>
                  </div>
                </div>

                {/* Tachometer RPM Bar */}
                <div className="w-36">
                  <div className="flex justify-between text-[10px] font-orbitron text-zinc-400 mb-0.5">
                    <span>RPM</span>
                    <span className="text-orange-400 font-bold">{Math.round(rpm * 14000)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-75"
                      style={{ width: `${rpm * 100}%` }}
                    />
                  </div>
                </div>

                {/* Nitro NOS Bottle Level */}
                <div className="w-36">
                  <div className="flex justify-between text-[10px] font-orbitron text-cyan-400 mb-0.5">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" /> NOS
                    </span>
                    <span className="font-bold">{Math.round(nitroFuel)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-75"
                      style={{ width: `${nitroFuel}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Mobile Throttle / Stunt Touch Controls (Right side) */}
            <div className="flex items-center gap-3">
              {/* Wheelie Stunt Trigger */}
              <button
                onPointerDown={() => onTouchInput('wheelie', true)}
                onPointerUp={() => onTouchInput('wheelie', false)}
                onPointerLeave={() => onTouchInput('wheelie', false)}
                className="w-12 h-12 rounded-2xl bg-purple-500/20 active:bg-purple-500 active:text-white border border-purple-500/40 font-bold text-xs flex flex-col items-center justify-center text-purple-400 transition shadow"
                title="Hold for Wheelie (Space / Q)"
              >
                🚀
                <span className="text-[9px] font-orbitron">WHEELIE</span>
              </button>

              {/* Nitro Boost Button */}
              <button
                onPointerDown={() => onTouchInput('nitro', true)}
                onPointerUp={() => onTouchInput('nitro', false)}
                onPointerLeave={() => onTouchInput('nitro', false)}
                className="w-12 h-12 rounded-2xl bg-cyan-500/20 active:bg-cyan-500 active:text-black border border-cyan-500/40 font-bold text-xs flex flex-col items-center justify-center text-cyan-400 transition shadow"
                title="Nitro NOS Boost (Shift)"
              >
                <Flame className="w-4 h-4 fill-current" />
                <span className="text-[9px] font-orbitron">NOS</span>
              </button>

              {/* Brake / Reverse Button */}
              <button
                onPointerDown={() => onTouchInput('backward', true)}
                onPointerUp={() => onTouchInput('backward', false)}
                onPointerLeave={() => onTouchInput('backward', false)}
                className="w-14 h-14 rounded-2xl bg-red-500/20 active:bg-red-500 active:text-white border border-red-500/40 font-black text-sm flex flex-col items-center justify-center text-red-400 transition shadow"
              >
                <span>BRAKE</span>
                <span className="text-[9px] text-zinc-400">REV</span>
              </button>

              {/* Throttle (Gas) Pedal Button */}
              <button
                onPointerDown={() => onTouchInput('forward', true)}
                onPointerUp={() => onTouchInput('forward', false)}
                onPointerLeave={() => onTouchInput('forward', false)}
                className="w-16 h-16 rounded-2xl bg-gradient-to-t from-orange-600 to-amber-500 active:scale-95 text-black font-black font-orbitron text-sm flex flex-col items-center justify-center shadow-lg shadow-orange-500/30 transition"
              >
                <span>GAS</span>
                <span className="text-[10px] font-bold tracking-widest">GO!</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
