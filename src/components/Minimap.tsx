/**
 * Super Bike India 3D - Minimap Radar Component
 * Realtime overhead radar displaying player position, heading, landmarks, and checkpoints.
 */

import React from 'react';
import { Compass, Fuel, Wrench, Flame } from 'lucide-react';

interface MinimapProps {
  playerX: number;
  playerZ: number;
  heading: number;
  speedKmh: number;
}

export const Minimap: React.FC<MinimapProps> = ({ playerX, playerZ, heading }) => {
  // Map world scale: world is 500x500 (-250 to 250)
  // Radar size: 140x140px, centered on player or fixed city view
  const mapSize = 130;
  const worldScale = mapSize / 500; // pixels per world meter

  const toMapX = (x: number) => mapSize / 2 + (x - playerX) * worldScale * 1.8;
  const toMapY = (z: number) => mapSize / 2 + (z - playerZ) * worldScale * 1.8;

  // Key landmarks
  const landmarks = [
    { label: 'Fuel', x: 30, z: 45, color: '#0284c7' },
    { label: 'Garage', x: -35, z: -40, color: '#f59e0b' },
    { label: 'Ramp', x: 120, z: -120, color: '#ef4444' },
    { label: 'Fort', x: -100, z: 100, color: '#d97706' },
  ];

  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-orange-500/60 bg-zinc-950/85 shadow-lg backdrop-blur-md">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Radar sweep ring */}
      <div className="absolute inset-2 rounded-full border border-orange-500/20 pointer-events-none" />
      <div className="absolute inset-8 rounded-full border border-orange-500/10 pointer-events-none" />

      {/* Crosshairs */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-orange-500/20 -translate-x-1/2" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-orange-500/20 -translate-y-1/2" />

      {/* Main road lines relative to player */}
      <div 
        className="absolute w-2 h-48 bg-zinc-600/40 -translate-x-1/2"
        style={{
          left: `${toMapX(0)}px`,
          top: `${toMapY(0) - 96}px`,
        }}
      />
      <div 
        className="absolute h-2 w-48 bg-zinc-600/40 -translate-y-1/2"
        style={{
          left: `${toMapX(0) - 96}px`,
          top: `${toMapY(0)}px`,
        }}
      />

      {/* Landmarks icons */}
      {landmarks.map((lm, i) => {
        const mx = toMapX(lm.x);
        const my = toMapY(lm.z);
        if (mx < 0 || mx > mapSize || my < 0 || my > mapSize) return null;
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white shadow"
            style={{ left: `${mx}px`, top: `${my}px`, backgroundColor: lm.color }}
            title={lm.label}
          >
            {lm.label[0]}
          </div>
        );
      })}

      {/* Player center marker with heading arrow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      >
        <div 
          className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-orange-500 drop-shadow-[0_0_6px_#f97316]"
          style={{ transform: `rotate(${-heading * (180 / Math.PI)}deg)` }}
        />
      </div>

      {/* Compass / Location label */}
      <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
        <Compass className="w-3 h-3 text-orange-400" />
        <span>{Math.round(playerX)},{Math.round(playerZ)}</span>
      </div>
    </div>
  );
};
