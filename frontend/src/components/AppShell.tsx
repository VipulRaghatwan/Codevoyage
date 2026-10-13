import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { SpaceBackground } from './SpaceBackground';
import { Modal } from './Modal';
import { GlowButton } from './GlowButton';
import byteImg from '../assets/images/byte_guide.jpg';

interface AppShellProps {
  backendOnline: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ backendOnline }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [byteGuideOpen, setByteGuideOpen] = useState(false);

  return (
    <SpaceBackground>
      <div className="min-h-screen flex flex-col">
        <Navbar backendOnline={backendOnline} />

        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            onOpenByteGuide={() => setByteGuideOpen(true)}
          />

          <main className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </main>
        </div>

        {/* Global Footer */}
        <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500 font-mono">
          CODEVOYAGE OS &bull; DEEP SPACE JAVA LEARNING PLATFORM &bull; IGNIS STATION SECTOR 1
        </footer>
      </div>

      {/* Friendly Robot Guide Modal (Byte) */}
      <Modal
        isOpen={byteGuideOpen}
        onClose={() => setByteGuideOpen(false)}
        title="Byte // Flight Companion AI"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-space-950/80 border border-cyber-cyan/30">
            <img
              src={byteImg}
              alt="Byte Guide"
              className="w-16 h-16 rounded-full object-cover border-2 border-cyber-cyan shadow-glow-cyan"
            />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <span>Unit B-Y-T-E</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-emerald/20 text-cyber-emerald">ACTIVE</span>
              </h4>
              <p className="text-xs text-slate-300 font-mono">
                "Beep-boop cadet! Ready to calibrate ship reactors with real Java code? Start at Ignis Station Mission 1!"
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-300 bg-space-900/60 p-3.5 rounded-xl border border-white/5">
            <span className="text-cyber-cyan font-bold">TACTICAL ADVICE:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Java syntax is strictly typed: always match types like <code className="text-white">int</code> and <code className="text-white">double</code>.</li>
              <li>Every statement terminates with a semicolon (<code className="text-white">;</code>).</li>
              <li>Use the CodeLab console to inspect compiler diagnostics in real-time.</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <GlowButton variant="primary" size="sm" onClick={() => setByteGuideOpen(false)}>
              Understood, Byte!
            </GlowButton>
          </div>
        </div>
      </Modal>
    </SpaceBackground>
  );
};
