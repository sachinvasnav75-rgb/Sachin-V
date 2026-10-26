/**
 * Super Bike India 3D - Career Challenges & Missions
 */

import React from 'react';
import { X, Trophy, Flag, Clock, Zap, CheckCircle2, Coins, ChevronRight } from 'lucide-react';
import { Mission } from '../types';
import confetti from 'canvas-confetti';
import { soundEngine } from '../audio/SoundManager';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missions: Mission[];
  activeMissionId?: string;
  onStartMission: (missionId: string) => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  missions,
  activeMissionId,
  onStartMission,
}) => {
  if (!isOpen) return null;

  const handleStart = (m: Mission) => {
    onStartMission(m.id);
    soundEngine.playStuntSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-zinc-950 border border-orange-500/40 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-orbitron text-white">
                CAREER MISSIONS & STUNT TRIALS
              </h2>
              <p className="text-xs text-zinc-400">Complete challenges to earn coins and unlock superbike upgrades</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mission List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {missions.map((m) => {
            const isActive = activeMissionId === m.id;
            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isActive
                    ? 'bg-orange-500/15 border-orange-500'
                    : m.completed
                    ? 'bg-zinc-900/40 border-zinc-800/60 opacity-80'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400">
                      {m.category}
                    </span>
                    {m.completed && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white">{m.title}</h3>
                  <p className="text-xs text-zinc-300 font-medium">{m.subtitle}</p>
                  <p className="text-[11px] text-zinc-400 mt-1">{m.description}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                  <div className="flex items-center gap-1 text-sm font-orbitron font-bold text-amber-400">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>+{m.rewardCoins}</span>
                  </div>

                  <button
                    onClick={() => handleStart(m)}
                    className={`px-4 py-2 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider transition ${
                      isActive
                        ? 'bg-emerald-500 text-black'
                        : m.completed
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        : 'bg-orange-500 hover:bg-orange-400 text-black shadow'
                    }`}
                  >
                    {isActive ? 'IN PROGRESS' : m.completed ? 'REPLAY' : 'START MISSION'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
