/**
 * Super Bike India 3D - High-Octane Main Menu
 */

import React from 'react';
import { Play, Flame, Wrench, Trophy, BookOpen, Volume2, ShieldCheck, Compass, Gauge, Zap } from 'lucide-react';
import { PlayerStats, VehicleConfig } from '../types';

interface MainMenuProps {
  stats: PlayerStats;
  currentVehicle: VehicleConfig;
  onStartRide: () => void;
  onOpenGarage: () => void;
  onOpenMissions: () => void;
  onOpenPhone: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  currentVehicle,
  onStartRide,
  onOpenGarage,
  onOpenMissions,
  onOpenPhone,
  onOpenSettings,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-6 sm:p-10 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Flame className="w-6 h-6 text-black fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 font-orbitron">
              ORIGINAL INDIAN OPEN WORLD
            </span>
            <div className="text-xl sm:text-2xl font-black font-orbitron tracking-tight text-white flex items-center gap-2">
              SUPER BIKE INDIA <span className="text-orange-500">3D</span>
            </div>
          </div>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs font-orbitron text-amber-400 flex items-center gap-2 shadow">
            <span>🪙</span>
            <span className="font-bold text-sm text-white">{stats.coins.toLocaleString()}</span>
            <span className="text-zinc-500">COINS</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition"
            title="Settings"
          >
            <span className="text-sm">⚙️</span>
          </button>
        </div>
      </div>

      {/* Center Hero Card */}
      <div className="my-auto max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Zap className="w-3.5 h-3.5" /> Ready to Ride
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-orbitron tracking-tighter text-white uppercase leading-none drop-shadow-md">
          CONQUER <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
            DESI HIGHWAYS
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 mt-4 leading-relaxed max-w-lg">
          Ride authentic superbikes, classic Bullet cruisers, and iconic Auto-Rickshaws across Indian flyovers, Delhi street markets, Rajasthan sand gates, and high-flying stunt mega arenas.
        </p>

        {/* Current Vehicle Badge */}
        <div className="mt-6 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-10 rounded-full"
              style={{ backgroundColor: currentVehicle.baseColor }}
            />
            <div>
              <div className="text-xs text-zinc-400 uppercase font-semibold">Active Vehicle</div>
              <div className="text-base font-bold font-orbitron text-white">{currentVehicle.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-orbitron">
            <div className="text-right">
              <div className="text-zinc-400">TOP SPEED</div>
              <div className="text-orange-400 font-bold">{currentVehicle.maxSpeed} KM/H</div>
            </div>
            <button
              onClick={onOpenGarage}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition text-xs"
            >
              CHANGE
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Menu Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-800/80">
        <button
          onClick={onStartRide}
          className="col-span-2 sm:col-span-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black font-orbitron text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 active:scale-98 transition"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>FREE ROAM</span>
        </button>

        <button
          onClick={onOpenGarage}
          className="py-4 px-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-white font-bold font-orbitron text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition shadow"
        >
          <Wrench className="w-4 h-4 text-orange-400" />
          <span>GARAGE & MODS</span>
        </button>

        <button
          onClick={onOpenMissions}
          className="py-4 px-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-white font-bold font-orbitron text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition shadow"
        >
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>CAREER MISSIONS</span>
        </button>

        <button
          onClick={onOpenPhone}
          className="py-4 px-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-white font-bold font-orbitron text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition shadow"
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>PHONE CHEATS</span>
        </button>
      </div>
    </div>
  );
};
