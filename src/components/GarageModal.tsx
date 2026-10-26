/**
 * Super Bike India 3D - Garage & Customization Studio
 * Buy, select, tune, and customize superbikes and Indian vehicles.
 */

import React, { useState } from 'react';
import { X, Check, Gauge, Zap, Shield, Sparkles, Coins, Flame } from 'lucide-react';
import { CustomizationState, VehicleConfig, VehicleId } from '../types';
import { VEHICLE_CATALOG } from '../data/vehicles';
import { soundEngine } from '../audio/SoundManager';

interface GarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVehicleId: VehicleId;
  customState: CustomizationState;
  coins: number;
  unlockedVehicles: VehicleId[];
  onSelectVehicle: (id: VehicleId) => void;
  onUnlockVehicle: (id: VehicleId, cost: number) => void;
  onSaveCustomization: (custom: CustomizationState) => void;
}

const COLOR_PALETTE = [
  { label: 'KTM Orange', hex: '#ea580c' },
  { label: 'Kawasaki Green', hex: '#16a34a' },
  { label: 'Stealth Black', hex: '#171717' },
  { label: 'Pulsar Red', hex: '#dc2626' },
  { label: 'Yamaha Blue', hex: '#2563eb' },
  { label: 'Saffron Gold', hex: '#f59e0b' },
  { label: 'Cyber Violet', hex: '#9333ea' },
  { label: 'Pure White', hex: '#f8fafc' },
];

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  onClose,
  currentVehicleId,
  customState,
  coins,
  unlockedVehicles,
  onSelectVehicle,
  onUnlockVehicle,
  onSaveCustomization,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleConfig>(
    VEHICLE_CATALOG.find((v) => v.id === currentVehicleId) || VEHICLE_CATALOG[0]
  );
  const [localCustom, setLocalCustom] = useState<CustomizationState>({ ...customState });
  const [activeTab, setActiveTab] = useState<'vehicles' | 'paint' | 'tuning'>('vehicles');

  if (!isOpen) return null;

  const isUnlocked = unlockedVehicles.includes(selectedVehicle.id);
  const isSelected = selectedVehicle.id === currentVehicleId;

  const handleSelectOrBuy = () => {
    if (isUnlocked) {
      onSelectVehicle(selectedVehicle.id);
      onSaveCustomization(localCustom);
      soundEngine.playStuntSuccess();
    } else if (coins >= selectedVehicle.price) {
      onUnlockVehicle(selectedVehicle.id, selectedVehicle.price);
      onSelectVehicle(selectedVehicle.id);
      soundEngine.playStuntSuccess();
    }
  };

  const handleApplyCustom = () => {
    onSaveCustomization(localCustom);
    soundEngine.playCheatBeep();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-orange-500/40 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/90 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-orbitron text-white tracking-wide">
                BHARAT SPEED GARAGE & TUNING
              </h2>
              <p className="text-xs text-zinc-400">Customize paint, exhausts, rims & dyno engine stages</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-orbitron font-bold text-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{coins.toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 px-6 pt-3 bg-zinc-900/50 border-b border-zinc-800/80">
          {[
            { id: 'vehicles', label: '1. Select Vehicle' },
            { id: 'paint', label: '2. Paint & Neon' },
            { id: 'tuning', label: '3. Engine & Exhaust' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl font-bold text-xs uppercase tracking-wider transition ${
                activeTab === tab.id
                  ? 'bg-zinc-950 text-orange-400 border-t-2 border-orange-500'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: VEHICLES */}
          {activeTab === 'vehicles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Selection List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Available Fleet ({VEHICLE_CATALOG.length})
                </h3>
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-2">
                  {VEHICLE_CATALOG.map((vehicle) => {
                    const isVUnlocked = unlockedVehicles.includes(vehicle.id);
                    const isVSelected = selectedVehicle.id === vehicle.id;
                    return (
                      <div
                        key={vehicle.id}
                        onClick={() => setSelectedVehicle(vehicle)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          isVSelected
                            ? 'bg-orange-500/15 border-orange-500 text-white shadow-md'
                            : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: vehicle.baseColor }}
                          />
                          <div>
                            <div className="font-bold text-sm">{vehicle.name}</div>
                            <div className="text-[11px] text-zinc-400 capitalize">
                              {vehicle.category} • Top {vehicle.maxSpeed} km/h
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          {isVUnlocked ? (
                            <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                              UNLOCKED
                            </span>
                          ) : (
                            <span className="text-[11px] font-orbitron font-bold text-amber-400">
                              {vehicle.price} COINS
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Vehicle Specs Card */}
              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-orange-400 font-bold">
                        {selectedVehicle.category}
                      </span>
                      <h4 className="text-2xl font-black font-orbitron text-white">
                        {selectedVehicle.name}
                      </h4>
                    </div>
                    <div 
                      className="w-6 h-6 rounded-lg border border-white/30"
                      style={{ backgroundColor: selectedVehicle.baseColor }}
                    />
                  </div>

                  <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                    {selectedVehicle.description}
                  </p>

                  {/* Performance Specs Bars */}
                  <div className="mt-5 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-orange-400" /> Top Speed
                        </span>
                        <span className="font-orbitron font-bold text-white">
                          {selectedVehicle.maxSpeed} km/h
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          style={{ width: `${(selectedVehicle.maxSpeed / 360) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-yellow-400" /> Acceleration
                        </span>
                        <span className="font-orbitron font-bold text-white">
                          {selectedVehicle.acceleration} / 10
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
                          style={{ width: `${selectedVehicle.acceleration * 10}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Cornering Handling
                        </span>
                        <span className="font-orbitron font-bold text-white">
                          {selectedVehicle.handling} / 10
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          style={{ width: `${selectedVehicle.handling * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mt-6 pt-4 border-t border-zinc-800">
                  <button
                    onClick={handleSelectOrBuy}
                    disabled={!isUnlocked && coins < selectedVehicle.price}
                    className={`w-full py-3.5 rounded-2xl font-black font-orbitron text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-98 shadow-lg ${
                      isSelected
                        ? 'bg-zinc-800 text-zinc-400 cursor-default'
                        : isUnlocked
                        ? 'bg-orange-500 hover:bg-orange-400 text-black'
                        : coins >= selectedVehicle.price
                        ? 'bg-amber-500 hover:bg-amber-400 text-black'
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4" /> CURRENTLY ACTIVE
                      </>
                    ) : isUnlocked ? (
                      'RIDE THIS VEHICLE'
                    ) : coins >= selectedVehicle.price ? (
                      `UNLOCK FOR ${selectedVehicle.price} COINS`
                    ) : (
                      `NEED ${selectedVehicle.price - coins} MORE COINS`
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAINT & NEON */}
          {activeTab === 'paint' && (
            <div className="space-y-6">
              {/* Primary Body Color */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  Body Fairing Color
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => {
                        setLocalCustom({ ...localCustom, color: c.hex });
                        onSaveCustomization({ ...localCustom, color: c.hex });
                      }}
                      className={`h-12 rounded-xl border-2 flex items-center justify-center transition active:scale-95 ${
                        localCustom.color === c.hex ? 'border-white ring-2 ring-orange-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {localCustom.color === c.hex && <Check className="w-5 h-5 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wheel Rim Color */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  Wheel Rim Finish
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => {
                        setLocalCustom({ ...localCustom, wheelColor: c.hex });
                        onSaveCustomization({ ...localCustom, wheelColor: c.hex });
                      }}
                      className={`h-12 rounded-xl border-2 flex items-center justify-center transition active:scale-95 ${
                        localCustom.wheelColor === c.hex ? 'border-white ring-2 ring-orange-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {localCustom.wheelColor === c.hex && <Check className="w-5 h-5 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neon Underglow Glow */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Cyber Neon Underglow</h4>
                  <p className="text-xs text-zinc-400">Illuminates the road surface beneath your bike at night</p>
                </div>
                <button
                  onClick={() => {
                    const next = !localCustom.neonEnabled;
                    setLocalCustom({ ...localCustom, neonEnabled: next });
                    onSaveCustomization({ ...localCustom, neonEnabled: next });
                  }}
                  className={`px-4 py-2 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider transition ${
                    localCustom.neonEnabled ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {localCustom.neonEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ENGINE & EXHAUST */}
          {activeTab === 'tuning' && (
            <div className="space-y-6">
              {/* Engine Stages */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  ECU Dyno Stage
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { stage: 1, title: 'Stage 1 OEM', desc: 'Factory stock power output and reliability', boost: '+0%' },
                    { stage: 2, title: 'Stage 2 Dyno Map', desc: 'Sharper throttle response and +15% top speed', boost: '+15%' },
                    { stage: 3, title: 'Stage 3 Turbocharge', desc: 'Extreme race cam, redline +25% top speed', boost: '+30%' },
                  ].map((s) => (
                    <div
                      key={s.stage}
                      onClick={() => {
                        setLocalCustom({ ...localCustom, engineStage: s.stage });
                        onSaveCustomization({ ...localCustom, engineStage: s.stage });
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition ${
                        localCustom.engineStage === s.stage
                          ? 'bg-orange-500/20 border-orange-500 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-orbitron font-bold text-sm text-white">{s.title}</span>
                        <span className="text-xs font-bold text-orange-400">{s.boost}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exhaust Silencer */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  Exhaust Silencer & Sound Note
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'stock', title: 'Stock OEM', desc: 'Muffled urban note' },
                    { id: 'sc_project', title: 'SC Project', desc: 'Aggressive Moto-GP rasp' },
                    { id: 'akrapovic', title: 'Akrapovič', desc: 'Carbon titanium roar' },
                    { id: 'freeflow', title: 'Free-Flow Desi', desc: 'Loud Indian straight-pipe' },
                  ].map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() => {
                        setLocalCustom({ ...localCustom, exhaust: ex.id as any });
                        onSaveCustomization({ ...localCustom, exhaust: ex.id as any });
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                        localCustom.exhaust === ex.id
                          ? 'bg-orange-500/20 border-orange-500 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs text-white mb-0.5">{ex.title}</div>
                      <div className="text-[10px] text-zinc-400">{ex.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Done Button */}
        <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black font-orbitron text-xs tracking-wider uppercase transition shadow"
          >
            CONFIRM & RETURN TO WORLD
          </button>
        </div>
      </div>
    </div>
  );
};
