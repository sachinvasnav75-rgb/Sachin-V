/**
 * Super Bike India 3D - In-Game Smartphone (Cheat & Spawn Dialer)
 * Inspired by Indian Bikes Driving 3D smartphone mechanic.
 */

import React, { useState } from 'react';
import { Phone, Delete, Zap, Sparkles, BookOpen, User, X, Check, Volume2 } from 'lucide-react';
import { IN_GAME_CHEATS } from '../data/cheats';
import { soundEngine } from '../audio/SoundManager';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCheat: (code: string) => { success: boolean; message: string };
}

export const PhoneModal: React.FC<PhoneModalProps> = ({ isOpen, onClose, onExecuteCheat }) => {
  const [dialNumber, setDialNumber] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dialer' | 'cheats' | 'contacts'>('dialer');
  const [callStatus, setCallStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    soundEngine.playCheatBeep();
    if (dialNumber.length < 8) {
      setDialNumber((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    soundEngine.playCheatBeep();
    setDialNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = (codeToRun?: string) => {
    const code = codeToRun || dialNumber;
    if (!code) return;

    soundEngine.playCheatBeep();
    const result = onExecuteCheat(code);
    setCallStatus(result.message);

    setTimeout(() => {
      setCallStatus(null);
      if (result.success) {
        onClose();
      }
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Smartphone Bezel */}
      <div className="relative w-full max-w-[340px] h-[640px] bg-zinc-950 rounded-[44px] p-3 shadow-2xl border-4 border-zinc-700 flex flex-col justify-between overflow-hidden">
        
        {/* Phone Notch & Speaker */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-zinc-900 rounded-full flex items-center justify-center z-20">
          <div className="w-10 h-1 bg-zinc-700 rounded-full mr-2" />
          <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full" />
        </div>

        {/* Screen Area */}
        <div className="relative w-full h-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 rounded-[34px] overflow-hidden flex flex-col pt-6 pb-2 px-3 text-white">
          
          {/* Status Bar */}
          <div className="flex items-center justify-between px-3 text-xs text-zinc-400 font-mono mb-2">
            <span>5G IND</span>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>100% ⚡</span>
          </div>

          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-7 right-4 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* App Header */}
          <div className="text-center mb-2">
            <h2 className="text-lg font-black tracking-wider text-orange-500 font-orbitron">
              DESI DIALER
            </h2>
            <p className="text-[11px] text-zinc-400">Spawn Superbikes & Secret Cheats</p>
          </div>

          {/* Call Status Feedback Popup */}
          {callStatus && (
            <div className="absolute inset-x-4 top-24 z-30 p-3 rounded-2xl bg-orange-500 text-zinc-950 text-center font-bold text-xs shadow-xl animate-in zoom-in-95">
              {callStatus}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-1 bg-zinc-800/70 p-1 rounded-xl mb-3 text-xs">
            <button
              onClick={() => setActiveTab('dialer')}
              className={`py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'dialer' ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Keypad
            </button>
            <button
              onClick={() => setActiveTab('cheats')}
              className={`py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'cheats' ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Cheat Book
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'contacts' ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Contacts
            </button>
          </div>

          {/* TAB 1: KEYPAD */}
          {activeTab === 'dialer' && (
            <div className="flex-1 flex flex-col justify-between pb-2">
              {/* Dialed Number Display */}
              <div className="h-14 flex items-center justify-center bg-zinc-950/80 rounded-2xl px-4 border border-zinc-800">
                <span className="text-3xl font-orbitron tracking-widest text-orange-400">
                  {dialNumber || <span className="text-zinc-600 text-lg">ENTER CODE...</span>}
                </span>
                {dialNumber && (
                  <button onClick={handleDelete} className="ml-auto text-zinc-400 hover:text-white">
                    <Delete className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Number Buttons Grid */}
              <div className="grid grid-cols-3 gap-2.5 my-auto px-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((char) => (
                  <button
                    key={char}
                    onClick={() => handleKeyPress(char)}
                    className="h-12 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-xl font-bold font-orbitron text-white flex items-center justify-center transition border border-zinc-700/40 shadow"
                  >
                    {char}
                  </button>
                ))}
              </div>

              {/* Green Call Action Button */}
              <button
                onClick={() => handleCall()}
                disabled={!dialNumber}
                className={`w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${
                  dialNumber
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Phone className="w-5 h-5 fill-current" />
                <span>SPAWN / DIAL CHEAT</span>
              </button>
            </div>
          )}

          {/* TAB 2: CHEAT BOOK */}
          {activeTab === 'cheats' && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scroll">
              <div className="text-[11px] text-zinc-400 px-1 mb-1">
                Tap any cheat code to immediately activate:
              </div>
              {IN_GAME_CHEATS.map((cheat) => (
                <div
                  key={cheat.code}
                  onClick={() => handleCall(cheat.code)}
                  className="p-2.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 cursor-pointer active:scale-98 transition flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 font-orbitron font-bold text-xs">
                        {cheat.code}
                      </span>
                      <span className="font-bold text-xs text-white">{cheat.title}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{cheat.effect}</p>
                  </div>
                  <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {[
                { name: 'Bhai Bike Spawner', role: 'Superbikes on demand', code: '1111' },
                { name: 'Bullet Raja', role: 'Classic Dug-Dug Cruiser', code: '3333' },
                { name: 'Auto Union Leader', role: 'Iconic 3-Wheeler Tuk-Tuk', code: '5555' },
                { name: 'Mausam Vibhag', role: 'Day / Sunset / Night Toggle', code: '1234' },
                { name: 'Stunt Arena Admin', role: 'Mega Sky Ramp Teleport', code: '9000' },
                { name: 'Nitro Mechanic', role: 'Unlimited NOS Boost Bottle', code: '8888' },
              ].map((c, i) => (
                <div
                  key={i}
                  onClick={() => handleCall(c.code)}
                  className="p-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/40 cursor-pointer flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
                      {c.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{c.name}</div>
                      <div className="text-[10px] text-zinc-400">{c.role}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-orbitron text-orange-400">{c.code}</span>
                </div>
              ))}
            </div>
          )}

          {/* Home indicator bar */}
          <div className="w-24 h-1 bg-zinc-600 rounded-full mx-auto mt-2" />
        </div>
      </div>
    </div>
  );
};
