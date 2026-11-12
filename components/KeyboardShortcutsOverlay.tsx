/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { XCircleIcon, KeyboardIcon } from './Icons';

interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  displayKeys: string[];
  action: string;
  category: 'movement' | 'orientation' | 'vertical' | 'system';
  description: string;
  badge?: string;
}

export const KeyboardShortcutsOverlay: React.FC<KeyboardShortcutsOverlayProps> = ({ isOpen, onClose }) => {
  const { pressedKeys, pressKey, releaseKey, viewMode, cameraControlsEnabled } = useAppContext();
  const [activeTab, setActiveTab] = useState<'all' | 'flight' | 'tips'>('all');

  // Handle ESC key to close overlay
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const shortcuts: ShortcutItem[] = [
    // WASD Movement
    {
      keys: ['w'],
      displayKeys: ['W'],
      action: 'Forward Thrust',
      category: 'movement',
      description: 'Accelerates ship forward in the current viewing direction.',
      badge: 'Main Engine',
    },
    {
      keys: ['s'],
      displayKeys: ['S'],
      action: 'Reverse / Brake',
      category: 'movement',
      description: 'Applies reverse thrusters to move backward and decelerate.',
      badge: 'Retro Thruster',
    },
    {
      keys: ['a'],
      displayKeys: ['A'],
      action: 'Strafe Left',
      category: 'movement',
      description: 'Slides ship horizontally to the left without altering heading.',
      badge: 'Port Thruster',
    },
    {
      keys: ['d'],
      displayKeys: ['D'],
      action: 'Strafe Right',
      category: 'movement',
      description: 'Slides ship horizontally to the right without altering heading.',
      badge: 'Starboard Thruster',
    },

    // Vertical Thrusters
    {
      keys: [' '],
      displayKeys: ['SPACE'],
      action: 'Ascend / Climb',
      category: 'vertical',
      description: 'Fires vertical lift thrusters to gain altitude smoothly.',
      badge: 'Vertical Lift',
    },
    {
      keys: ['shift'],
      displayKeys: ['SHIFT'],
      action: 'Descend / Dive',
      category: 'vertical',
      description: 'Reduces altitude smoothly with downward gravitational thrusters.',
      badge: 'Descent Engine',
    },

    // Arrow Keys Look / Attitude
    {
      keys: ['arrowup'],
      displayKeys: ['↑'],
      action: 'Pitch Down',
      category: 'orientation',
      description: 'Tilts ship nose downward (dives toward terrain/surface).',
      badge: 'Gimbal Pitch',
    },
    {
      keys: ['arrowdown'],
      displayKeys: ['↓'],
      action: 'Pitch Up',
      category: 'orientation',
      description: 'Tilts ship nose upward (climbs toward the sky/horizon).',
      badge: 'Gimbal Pitch',
    },
    {
      keys: ['arrowleft'],
      displayKeys: ['←'],
      action: 'Yaw Left (Turn Port)',
      category: 'orientation',
      description: 'Rotates heading left with automatic aerodynamic bank roll.',
      badge: 'Yaw + Roll',
    },
    {
      keys: ['arrowright'],
      displayKeys: ['→'],
      action: 'Yaw Right (Turn Starboard)',
      category: 'orientation',
      description: 'Rotates heading right with automatic aerodynamic bank roll.',
      badge: 'Yaw + Roll',
    },
  ];

  // Helper to check if a shortcut key is actively being held
  const isKeyActive = (keyStr: string) => pressedKeys.has(keyStr.toLowerCase());

  // Interactive Key Component that lights up live and can be clicked
  const KeyCap: React.FC<{
    keyId: string;
    label: string;
    sublabel?: string;
    widthClass?: string;
  }> = ({ keyId, label, sublabel, widthClass = 'w-12 sm:w-14' }) => {
    const active = isKeyActive(keyId);

    const handlePointerDown = (e: React.PointerEvent) => {
      e.preventDefault();
      pressKey(keyId);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      e.preventDefault();
      releaseKey(keyId);
    };

    return (
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`h-12 sm:h-14 ${widthClass} select-none cursor-pointer rounded-xl font-mono flex flex-col items-center justify-center border transition-all duration-100 relative
          ${active
            ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-95 translate-y-0.5'
            : 'bg-gray-800/80 hover:bg-gray-700/80 border-gray-600/80 text-gray-200 shadow-[0_4px_0_0_rgba(15,23,42,0.9)] hover:border-gray-500'
          }`}
        title={`Key: ${label} (${sublabel || 'Navigation'}) - Hold to simulate`}
      >
        <span className="text-sm sm:text-base font-bold leading-none">{label}</span>
        {sublabel && (
          <span className={`text-[9px] uppercase tracking-wider mt-0.5 font-sans leading-none ${active ? 'text-cyan-300' : 'text-gray-400'}`}>
            {sublabel}
          </span>
        )}
        {active && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping pointer-events-none" />
        )}
      </div>
    );
  };

  const filteredShortcuts = activeTab === 'all'
    ? shortcuts
    : activeTab === 'flight'
      ? shortcuts.filter(s => s.category === 'movement' || s.category === 'vertical')
      : shortcuts.filter(s => s.category === 'orientation');

  // Currently active pressed keys formatted for status banner
  const activeKeysArray = Array.from(pressedKeys);

  return (
    <div
      className={`fixed inset-0 z-50 transition-visibility duration-300 ${
        isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="3D Navigation Keyboard Shortcuts"
    >
      {/* Backdrop with fade */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Slide-in panel container from the right */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[500px] md:w-[540px] max-w-full bg-gray-900/95 backdrop-blur-xl border-l border-cyan-500/30 text-white shadow-2xl shadow-cyan-950/50 flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <KeyboardIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-wide text-white flex items-center gap-2">
                <span>Flight Navigation Controls</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                  3D Engine
                </span>
              </h2>
              <p className="text-xs text-gray-400">Interactive keyboard shortcuts & telemetry</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-400">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Close shortcuts overlay"
            >
              <XCircleIcon className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Live Input Telemetry Ribbon */}
        <div className="px-5 py-2.5 bg-gray-950/80 border-b border-gray-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeKeysArray.length > 0 ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeKeysArray.length > 0 ? 'bg-cyan-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="font-mono text-[11px] text-gray-300 uppercase tracking-wider">
              Live Key Sensor:
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[260px] no-scrollbar">
            {activeKeysArray.length === 0 ? (
              <span className="text-gray-500 font-mono text-[11px] italic">
                Press any key to test
              </span>
            ) : (
              activeKeysArray.map((k) => (
                <span
                  key={k}
                  className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-cyan-500/20 border border-cyan-400 text-cyan-300 animate-pulse uppercase"
                >
                  {k === ' ' ? 'SPACE' : k}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto px-5 py-4 space-y-6 custom-scrollbar">
          {/* Interactive Visual Keyboard Mockup */}
          <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span>Interactive Flight Pad</span>
                <span className="text-[10px] text-gray-500 font-normal lowercase">(press physical keys or click)</span>
              </h3>
              <span className="text-[11px] font-mono text-gray-400">
                Mode: <strong className="text-white capitalize">{viewMode}</strong>
              </span>
            </div>

            {/* Layout representation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column: WASD + Vertical */}
              <div className="flex flex-col items-center bg-gray-900/40 p-3 rounded-xl border border-gray-800/60">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Translational Thrust
                </span>

                {/* WASD Cluster */}
                <div className="flex flex-col items-center gap-1.5 mb-3">
                  <KeyCap keyId="w" label="W" sublabel="Fwd" />
                  <div className="flex items-center gap-1.5">
                    <KeyCap keyId="a" label="A" sublabel="Left" />
                    <KeyCap keyId="s" label="S" sublabel="Back" />
                    <KeyCap keyId="d" label="D" sublabel="Right" />
                  </div>
                </div>

                {/* Space & Shift Altitude */}
                <div className="w-full flex items-center justify-center gap-2 pt-1 border-t border-gray-800/60">
                  <KeyCap keyId="shift" label="SHIFT" sublabel="Descend" widthClass="flex-1 max-w-[100px]" />
                  <KeyCap keyId=" " label="SPACE" sublabel="Ascend" widthClass="flex-1 max-w-[120px]" />
                </div>
              </div>

              {/* Right Column: Arrow Keys Attitude */}
              <div className="flex flex-col items-center bg-gray-900/40 p-3 rounded-xl border border-gray-800/60">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Pitch & Yaw Rotation
                </span>

                {/* Arrow Keys Cluster */}
                <div className="flex flex-col items-center gap-1.5 my-auto">
                  <KeyCap keyId="arrowup" label="↑" sublabel="Pitch ▼" />
                  <div className="flex items-center gap-1.5">
                    <KeyCap keyId="arrowleft" label="←" sublabel="Yaw ◄" />
                    <KeyCap keyId="arrowdown" label="↓" sublabel="Pitch ▲" />
                    <KeyCap keyId="arrowright" label="→" sublabel="Yaw ►" />
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 text-center mt-3 pt-2 border-t border-gray-800/60 w-full">
                  Turning left/right adds automatic aerodynamic roll banking
                </p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-800 pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              All Shortcuts ({shortcuts.length})
            </button>
            <button
              onClick={() => setActiveTab('flight')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'flight'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Movement & Vertical (WASD + Space/Shift)
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'tips'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Look & Pitch (Arrows)
            </button>
          </div>

          {/* Detailed Shortcuts List */}
          <div className="space-y-2.5">
            {filteredShortcuts.map((item, idx) => {
              const active = item.keys.some(isKeyActive);
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all duration-150 flex items-start justify-between gap-3 ${
                    active
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-gray-800/40 hover:bg-gray-800/70 border-gray-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm text-white">
                        {item.action}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-700/60 text-gray-300 border border-gray-600/50">
                          {item.badge}
                        </span>
                      )}
                      {active && (
                        <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1">
                          ● ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {item.displayKeys.map((keyName, kIdx) => (
                      <kbd
                        key={kIdx}
                        className={`min-w-[34px] h-8 px-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center border shadow-sm transition-all ${
                          active
                            ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                            : 'bg-gray-900 border-gray-700 text-gray-200'
                        }`}
                      >
                        {keyName}
                      </kbd>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Tips & Flight Techniques */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <span className="text-cyan-400">✦</span> Flight Pilot Techniques
            </h4>
            <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
              <li>
                <strong className="text-gray-200">Cinematic Banking:</strong> Hold <kbd className="px-1 py-0.5 bg-gray-800 rounded font-mono text-[10px]">W</kbd> while pressing <kbd className="px-1 py-0.5 bg-gray-800 rounded font-mono text-[10px]">←</kbd> or <kbd className="px-1 py-0.5 bg-gray-800 rounded font-mono text-[10px]">→</kbd> to bank into high-speed canyon turns.
              </li>
              <li>
                <strong className="text-gray-200">Level Flight Offset:</strong> The flight computer applies a +0.1 pitch offset so you cruise level while viewing terrain ahead.
              </li>
              <li>
                <strong className="text-gray-200">Custom Sensitivity & Inversion:</strong> Open Settings (<span className="text-gray-200 font-mono">⚙</span>) to invert pitch, yaw, or adjust thruster speeds.
              </li>
              <li>
                <strong className="text-gray-200">Quick Toggle:</strong> Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded font-mono text-[10px] text-gray-300">?</kbd> on your keyboard at any time to open/close this guide.
              </li>
            </ul>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-gray-800 bg-gray-950 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">
            {cameraControlsEnabled ? '3D Navigation: Online' : '3D Navigation: Standby'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs rounded-xl shadow-lg shadow-cyan-900/30 transition-all transform active:scale-95"
          >
            Resume Flight
          </button>
        </div>
      </div>
    </div>
  );
};
