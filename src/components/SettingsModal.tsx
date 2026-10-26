/**
 * Super Bike India 3D - Settings & Graphics Modal
 */

import React from 'react';
import { X, Sun, Moon, CloudRain, Volume2, Sliders, Monitor, Eye } from 'lucide-react';
import { WeatherType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherType;
  onChangeWeather: (w: WeatherType) => void;
  graphicsPreset: 'low' | 'medium' | 'high';
  onChangeGraphics: (preset: 'low' | 'medium' | 'high') => void;
  volume: number;
  onChangeVolume: (v: number) => void;
  sensitivity: number;
  onChangeSensitivity: (s: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  weather,
  onChangeWeather,
  graphicsPreset,
  onChangeGraphics,
  volume,
  onChangeVolume,
  sensitivity,
  onChangeSensitivity,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-orange-500/40 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-black font-orbitron text-white">GAME SETTINGS</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Weather & Atmosphere */}
        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
            Environment & Time of Day
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'sunny', label: 'Day', icon: Sun },
              { id: 'golden_hour', label: 'Sunset', icon: Sun },
              { id: 'night', label: 'Night', icon: Moon },
              { id: 'rainy', label: 'Rain', icon: CloudRain },
            ].map((w) => {
              const Icon = w.icon;
              return (
                <button
                  key={w.id}
                  onClick={() => onChangeWeather(w.id as any)}
                  className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 border transition ${
                    weather === w.id
                      ? 'bg-orange-500/20 border-orange-500 text-white font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{w.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Graphics Preset */}
        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
            Graphics Quality
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'low', label: 'Low (60 FPS)' },
              { id: 'medium', label: 'Medium HD' },
              { id: 'high', label: 'Ultra 3D' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => onChangeGraphics(p.id as any)}
                className={`py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition ${
                  graphicsPreset === p.id
                    ? 'bg-orange-500 text-black border-orange-500'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Audio Volume Slider */}
        <div>
          <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-orange-400" /> Master Volume
            </span>
            <span className="text-white font-orbitron">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer"
          />
        </div>

        {/* 4. Controls Sensitivity Slider */}
        <div>
          <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            <span>Steering Sensitivity</span>
            <span className="text-white font-orbitron">{sensitivity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={sensitivity}
            onChange={(e) => onChangeSensitivity(parseFloat(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer"
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-black font-black font-orbitron text-xs tracking-wider uppercase transition shadow"
        >
          SAVE & CLOSE
        </button>
      </div>
    </div>
  );
};
