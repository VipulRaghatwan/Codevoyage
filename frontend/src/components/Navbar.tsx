import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Rocket, MapPin, Terminal, Award, Radio, LogIn, UserPlus, LogOut, Flame, Coins, Shield, BookOpen, GitFork, Activity, Volume2, VolumeX, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundManager } from '../services/soundService';
import { AudioSettingsModal } from './AudioSettingsModal';

interface NavbarProps {
  backendOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ backendOnline }) => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [muted, setMuted] = useState<boolean>(soundManager.isMuted());
  const [showAudioModal, setShowAudioModal] = useState<boolean>(false);

  const handleToggleSound = () => {
    const isNowEnabled = soundManager.toggleMute();
    setMuted(!isNowEnabled);
  };

  const navItems = [
    { name: 'Mission Control', path: '/dashboard', icon: Rocket },
    { name: 'Galaxy Map', path: '/map', icon: MapPin },
    { name: 'Skill Tree', path: '/skills', icon: GitFork },
    { name: 'Java Codex', path: '/codex', icon: BookOpen },
    { name: 'Analytics', path: '/analytics', icon: Activity },
    { name: 'CodeLab', path: '/codelab', icon: Terminal },
    { name: 'Achievements', path: '/achievements', icon: Award },
    { name: 'Profile', path: '/profile', icon: UserPlus },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyber-purple to-cyber-cyan flex items-center justify-center p-0.5 shadow-glow-cyan transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-space-950 rounded-[7px] flex items-center justify-center">
              <Rocket className="w-5 h-5 text-cyber-cyan transition-transform group-hover:-translate-y-0.5" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold tracking-wider text-white">
              CODE<span className="text-cyber-cyan">VOYAGE</span>
            </span>
            <span className="block text-[10px] tracking-widest text-slate-400 font-mono -mt-1 uppercase">
              Java Adventure OS
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  isActive
                    ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 shadow-glow-cyan'
                    : 'text-slate-300 hover:text-white hover:bg-space-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User HUD / Auth Controls */}
        <div className="flex items-center space-x-3">
          {/* Spring status indicator */}
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-space-900/80 border border-white/10 text-[11px] font-mono">
            <Radio className={`w-3 h-3 ${backendOnline ? 'text-cyber-emerald animate-pulse' : 'text-cyber-crimson'}`} />
            <span className="text-slate-400">Core:</span>
            <span className={backendOnline ? 'text-cyber-emerald font-bold' : 'text-cyber-crimson font-bold'}>
              {backendOnline ? 'ONLINE' : 'LINKING'}
            </span>
          </div>

          {/* Sound Synthesizer Audio Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-lg border transition-all text-xs font-mono flex items-center justify-center ${
                !muted
                  ? 'bg-space-900 border-cyber-cyan/40 text-cyber-cyan shadow-glow-cyan/20'
                  : 'bg-space-950 border-space-800 text-slate-500 hover:text-slate-400'
              }`}
              title={!muted ? 'Game Audio: Active (Click to mute)' : 'Game Audio: Muted (Click to enable)'}
            >
              {!muted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setShowAudioModal(true)}
              className="p-2 rounded-lg border border-space-800 bg-space-950 text-slate-400 hover:text-cyber-cyan hover:border-cyber-cyan/30 transition-all text-xs font-mono flex items-center justify-center"
              title="Open Audio Mixer & Synthesizer Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              {/* Cadet Game Stats HUD */}
              <div className="hidden sm:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-space-900/90 border border-white/10 text-xs font-mono">
                <div className="flex items-center space-x-1 text-cyber-cyan font-bold" title="Cadet Level">
                  <Shield className="w-3.5 h-3.5" />
                  <span>LVL {user.level || 1}</span>
                </div>
                <span className="text-slate-600">|</span>
                <div className="flex items-center space-x-1 text-cyber-amber font-semibold" title="Energy Coins">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{user.coins || 0}</span>
                </div>
                <span className="text-slate-600">|</span>
                <div className="flex items-center space-x-1 text-rose-400 font-semibold" title="Mission Streak">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{user.streak || 0}d</span>
                </div>
              </div>

              {/* Callsign & Logout */}
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="text-xs font-mono font-bold text-white bg-space-800 hover:bg-space-700 px-2.5 py-1 rounded border border-white/10 hover:border-cyber-cyan/40 transition-colors"
                  title="View Cadet Profile"
                >
                  {user.username}
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-space-800 border border-transparent hover:border-rose-500/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono text-slate-300 hover:text-white hover:bg-space-800/80 border border-white/10 flex items-center space-x-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono text-space-950 bg-cyber-cyan hover:bg-cyan-300 shadow-glow-cyan flex items-center space-x-1.5 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Enlist</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Audio Mixing & Synthesizer Modal */}
      <AudioSettingsModal
        isOpen={showAudioModal}
        onClose={() => setShowAudioModal(false)}
      />
    </header>
  );
};
