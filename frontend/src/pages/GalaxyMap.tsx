import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { missionService, WorldData, MissionSummary } from '../services/missionService';
import { useAuth } from '../context/AuthContext';
import { Starfield } from '../game/Starfield';
import { GlassCard } from '../components/GlassCard';
import { GlowButton } from '../components/GlowButton';
import { LoadingState } from '../components/LoadingState';
import {
  Rocket,
  Lock,
  CheckCircle2,
  Play,
  Star,
  Award,
  ChevronRight,
  Shield,
  Sparkles,
  Compass,
  Zap,
  ArrowLeft,
  Flame,
  Radio,
  X,
  Code2
} from 'lucide-react';
import { RobotCompanion } from '../game/RobotCompanion';

import ignisImg from '../assets/images/ignis_station.jpg';
import kryonImg from '../assets/images/kryon_belt.jpg';
import novaImg from '../assets/images/nova_sector.jpg';
import nebulaImg from '../assets/images/function_nebula.jpg';

interface WorldVisualConfig {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  image: string;
  coordinates: { x: number; y: number }; // percentage on galaxy canvas
  color: string;
  orbitRadius: number;
  glowColor: string;
}

const WORLD_CONFIGS: Record<number, WorldVisualConfig> = {
  1: {
    slug: 'ignis-station',
    code: 'WORLD 1',
    name: 'IGNIS STATION',
    tagline: 'Volcanic Asteroid Mining Outpost',
    image: ignisImg,
    coordinates: { x: 22, y: 55 },
    color: '#F59E0B',
    orbitRadius: 180,
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  2: {
    slug: 'kryon-belt',
    code: 'WORLD 2',
    name: 'KRYON BELT',
    tagline: 'Glacial Sub-Zero Asteroid Barrier',
    image: kryonImg,
    coordinates: { x: 44, y: 32 },
    color: '#00F0FF',
    orbitRadius: 280,
    glowColor: 'rgba(0, 240, 255, 0.4)',
  },
  3: {
    slug: 'nova-sector',
    code: 'WORLD 3',
    name: 'NOVA SECTOR',
    tagline: 'Plasma Flare & Electromagnetic Core',
    image: novaImg,
    coordinates: { x: 70, y: 42 },
    color: '#8B5CF6',
    orbitRadius: 390,
    glowColor: 'rgba(139, 92, 246, 0.4)',
  },
  4: {
    slug: 'function-nebula',
    code: 'WORLD 4',
    name: 'FUNCTION NEBULA',
    tagline: 'Interstellar Quantum Sensor Mesh',
    image: nebulaImg,
    coordinates: { x: 86, y: 68 },
    color: '#10B981',
    orbitRadius: 500,
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
};

export const GalaxyMap: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const defaultWorlds: WorldData[] = useMemo(() => [
    {
      id: 1,
      worldOrder: 1,
      slug: 'ignis-station',
      name: 'WORLD 1 — IGNIS STATION',
      theme: 'Volcanic Asteroid Mining Outpost',
      lore: 'An industrial mining outpost orbiting a volcanic gas dwarf star. Cadets begin here to reboot dark starship terminals, calibrate primary life support, and establish communications through authentic Java code.',
      unlockedByDefault: true,
      missions: [
        { id: 1, missionOrder: 1, title: 'Powering the Console', slug: 'powering-the-console', objective: 'Construct a valid Java class named Solution and output the exact diagnostic code: IGNIS STATION: ONLINE', javaConcept: 'Java Basics & Program Structure', xpReward: 100, starsReward: 3, difficulty: 'EASY', unlocked: true, completed: false, starsEarned: 0 },
        { id: 2, missionOrder: 2, title: 'Ship Systems', slug: 'ship-systems', objective: 'Declare and assign core diagnostic variables for reactor integrity', javaConcept: 'Variables & Memory Allocation', xpReward: 120, starsReward: 3, difficulty: 'EASY', unlocked: false, completed: false, starsEarned: 0 },
        { id: 3, missionOrder: 3, title: 'Receiving Transmissions', slug: 'receiving-transmissions', objective: 'Parse incoming subspace telemetry signals using primitive types and casting', javaConcept: 'Primitive Data Types & Type Casting', xpReward: 150, starsReward: 3, difficulty: 'MEDIUM', unlocked: false, completed: false, starsEarned: 0 },
        { id: 4, missionOrder: 4, title: 'Engine Control', slug: 'engine-control', objective: 'Read pilot command input and print formatted propulsion vectors', javaConcept: 'Input / Output & Formatted Printing', xpReward: 160, starsReward: 3, difficulty: 'MEDIUM', unlocked: false, completed: false, starsEarned: 0 },
        { id: 5, missionOrder: 5, title: 'Emergency Protocol', slug: 'emergency-protocol', objective: 'Calculate airlock delta and trigger critical alerts using arithmetic and logic', javaConcept: 'Operators & Relational Logic', xpReward: 180, starsReward: 3, difficulty: 'HARD', unlocked: false, completed: false, starsEarned: 0 }
      ]
    },
    {
      id: 2,
      worldOrder: 2,
      slug: 'kryon-belt',
      name: 'WORLD 2 — KRYON BELT',
      theme: 'Glacial Sub-Zero Asteroid Barrier',
      lore: 'A dense belt of frozen methane asteroids and sub-zero orbital stations. Cadets learn conditional branching, switch controls, and nested logic to steer shield deflector arrays.',
      unlockedByDefault: false,
      missions: [
        { id: 6, missionOrder: 1, title: 'Thermal Deflector Switch', slug: 'thermal-deflector-switch', objective: 'Implement a switch statement to route shield power across cryogenic frost storm frequencies', javaConcept: 'Conditional Branching & Switch Statements', xpReward: 140, starsReward: 3, difficulty: 'EASY', unlocked: true, completed: false, starsEarned: 0 },
        { id: 7, missionOrder: 2, title: 'Ice Shield Resonance', slug: 'ice-shield-resonance', objective: 'Apply compound boolean expressions (&&, ||) to protect ship hull from high-stress impacts', javaConcept: 'Compound Booleans & Nested Decisions', xpReward: 160, starsReward: 3, difficulty: 'MEDIUM', unlocked: false, completed: false, starsEarned: 0 },
        { id: 8, missionOrder: 3, title: 'Sub-Zero Thruster Gating', slug: 'sub-zero-thruster-gating', objective: 'Calculate propulsion output state using compact boolean ternary expressions', javaConcept: 'Ternary Operator & Inline Logic', xpReward: 170, starsReward: 3, difficulty: 'MEDIUM', unlocked: false, completed: false, starsEarned: 0 },
        { id: 9, missionOrder: 4, title: 'Subspace Beacon Parser', slug: 'subspace-beacon-parser', objective: 'Decode navigation orders using Java String equals() comparisons', javaConcept: 'String Equality & String Methods', xpReward: 180, starsReward: 3, difficulty: 'MEDIUM', unlocked: false, completed: false, starsEarned: 0 },
        { id: 10, missionOrder: 5, title: 'BOSS: Cryo-Grid Override', slug: 'cryo-grid-override', objective: 'Synthesize authorization codes, shield gates, and temperature safety systems', javaConcept: 'Comprehensive Decision System Synthesis', xpReward: 250, starsReward: 3, difficulty: 'HARD', unlocked: false, completed: false, starsEarned: 0 }
      ]
    },
    {
      id: 3,
      worldOrder: 3,
      slug: 'nova-sector',
      name: 'WORLD 3 — NOVA SECTOR',
      theme: 'Plasma Flare & Electromagnetic Core',
      lore: 'High-radiation orbital zone surrounding an unstable hyper-pulsar.',
      unlockedByDefault: false,
      missions: []
    },
    {
      id: 4,
      worldOrder: 4,
      slug: 'function-nebula',
      name: 'WORLD 4 — FUNCTION NEBULA',
      theme: 'Interstellar Quantum Sensor Mesh',
      lore: 'A swirling nebula of crystalline cosmic dust and distributed sensor arrays.',
      unlockedByDefault: false,
      missions: []
    }
  ], []);

  const [worlds, setWorlds] = useState<WorldData[]>(defaultWorlds);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedWorld, setSelectedWorld] = useState<WorldData | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchGalaxyData = async () => {
      try {
        const data = await missionService.getWorlds();
        if (isMounted && data && data.length > 0) {
          setWorlds(data);
        }
      } catch (err) {
        console.error('Failed to load galaxy worlds', err);
      }
    };

    fetchGalaxyData();
    return () => {
      isMounted = false;
    };
  }, []);

  const ignisWorld = useMemo(() => {
    return worlds.find((w) => w.worldOrder === 1) || defaultWorlds[0];
  }, [worlds, defaultWorlds]);

  // Determine which world's missions are currently viewed in the modal or active
  const currentModalWorld = useMemo(() => {
    if (selectedWorld) {
      return worlds.find((w) => w.id === selectedWorld.id) || selectedWorld;
    }
    return ignisWorld;
  }, [selectedWorld, worlds, ignisWorld]);

  // Determine mission statuses: completed, current, available, locked for the selected world
  const processedMissions = useMemo(() => {
    const targetWorld = currentModalWorld || ignisWorld;
    const missions = targetWorld?.missions || [];

    let currentFound = false;
    return missions.map((m) => {
      let state: 'completed' | 'current' | 'available' | 'locked' = 'locked';

      if (m.completed) {
        state = 'completed';
      } else if (m.unlocked && !currentFound) {
        state = 'current';
        currentFound = true;
      } else if (m.unlocked) {
        state = 'available';
      } else {
        state = 'locked';
      }

      return {
        ...m,
        state,
      };
    });
  }, [currentModalWorld, ignisWorld]);

  const activeMission = useMemo(() => {
    return processedMissions.find((m) => m.state === 'current') || processedMissions[0];
  }, [processedMissions]);

  const handleWorldClick = (world: WorldData) => {
    const isUnlocked = world.worldOrder === 1 || Boolean(world.unlockedByDefault) || (user?.currentSector != null && user.currentSector >= world.worldOrder);
    if (!isUnlocked) {
      return;
    }
    setSelectedWorld(world);
  };

  if (loading && worlds.length === 0) {
    return (
      <div className="py-32">
        <LoadingState message="CALIBRATING LONG-RANGE STELLAR SENSORS..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-between overflow-hidden">
      {/* Dynamic Starfield canvas */}
      <Starfield />

      {/* Top Map HUD Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-space-950/80 border border-cyber-cyan/30 backdrop-blur-xl shadow-glow-cyan/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black text-white font-mono tracking-wider uppercase">
                GALAXY MAP // SECTOR 01 NAVIGATION MATRIX
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-emerald/20 text-cyber-emerald font-mono font-bold">
                RADAR ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Track: <span className="text-cyber-cyan font-bold">Java 21 Core</span> • Sector: <span className="text-amber-400 font-bold">Ignis Station</span> • Pilot: <span className="text-slate-200">{user?.username || 'Cadet'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <GlowButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            COMMAND CENTER
          </GlowButton>
          <GlowButton
            variant="primary"
            size="sm"
            onClick={() => ignisWorld && handleWorldClick(ignisWorld)}
            icon={<Rocket className="w-3.5 h-3.5 text-space-950" />}
          >
            ENTER IGNIS STATION
          </GlowButton>
        </div>
      </div>

      {/* B.Y.T.E. Galaxy Navigation Guidance */}
      <div className="relative z-10 mt-4">
        <RobotCompanion
          message={
            selectedWorld
              ? 'Sector directives retrieved. Review mission conduits and launch the active protocol.'
              : 'Stellar coordinates locked, Cadet! Ignis Station is currently online. Select the planet to view mission progression.'
          }
          subtext="Java 21 foundational track: complete missions in sequence to unlock outer sector hyper-lanes."
          mood="encouraging"
          compact={false}
        />
      </div>

      {/* Futuristic Interactive Galaxy Viewport */}
      <div className="relative z-10 my-6 flex-1 w-full min-h-[540px] sm:min-h-[620px] rounded-3xl border border-white/10 bg-space-950/60 backdrop-blur-md overflow-hidden flex items-center justify-center">
        {/* Orbital SVG paths, radar beam sweep & route conduits */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#00F0FF" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Radar sweep radial gradient */}
            <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.08" />
              <stop offset="70%" stopColor="#00f0ff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Concentric planetary orbit guides */}
          <circle cx="50%" cy="50%" r="180" fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="6 6" />
          <circle cx="50%" cy="50%" r="280" fill="none" stroke="rgba(255,255,255,0.04)" strokeDasharray="8 8" />
          <circle cx="50%" cy="50%" r="390" fill="none" stroke="rgba(255,255,255,0.03)" strokeDasharray="10 10" />

          {/* Subtle Radar Scan Rotating Beam */}
          <g className="origin-center" style={{ transformOrigin: '50% 50%' }}>
            <circle cx="50%" cy="50%" r="390" fill="url(#radarSweep)" />
            <line
              x1="50%"
              y1="50%"
              x2="90%"
              y2="50%"
              stroke="rgba(0, 240, 255, 0.25)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="origin-center animate-[spin_14s_linear_infinite] motion-reduce:hidden"
              style={{ transformOrigin: '50% 50%' }}
            />
          </g>

          {/* Glowing Hyperspace Mission Route connecting Worlds */}
          <path
            d="M 22% 55% Q 33% 40%, 44% 32% T 70% 42% T 86% 68%"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3"
            strokeDasharray="8 6"
            className="animate-pulse"
            filter="url(#glow)"
          />
        </svg>

        {/* Distant Spacecraft Traffic (Subtle Transits Across Sector) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 motion-reduce:hidden">
          {/* Traffic drone 1: Deep space survey vessel drifting upper lane */}
          <motion.div
            initial={{ x: '-10%', y: '18%', opacity: 0 }}
            animate={{ x: '115%', y: '24%', opacity: [0, 0.7, 0.7, 0] }}
            transition={{ duration: 32, repeat: Infinity, ease: 'linear', delay: 2 }}
            className="absolute flex items-center space-x-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan shadow-[0_0_8px_#00f0ff]" />
            <div className="w-8 h-0.5 bg-gradient-to-r from-cyber-cyan to-transparent rounded-full opacity-60" />
            <span className="text-[8px] font-mono text-cyan-400/60 uppercase">CARGO-409</span>
          </motion.div>

          {/* Traffic drone 2: Patrol shuttle cruising near Kryon Belt */}
          <motion.div
            initial={{ x: '95%', y: '75%', opacity: 0 }}
            animate={{ x: '-15%', y: '60%', opacity: [0, 0.6, 0.6, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear', delay: 10 }}
            className="absolute flex items-center space-x-1.5"
          >
            <div className="w-6 h-0.5 bg-gradient-to-l from-amber-400 to-transparent rounded-full opacity-50" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_60px_#f59e0b]" />
            <span className="text-[8px] font-mono text-amber-400/50 uppercase">PATROL-08</span>
          </motion.div>
        </div>

        {/* Floating Sector Telemetry Labels */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none hidden md:block">
          <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-space-900/60 p-3 rounded-xl border border-space-800 backdrop-blur-md">
            <div className="text-cyber-cyan font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping motion-reduce:hidden" />
              <span>SECTOR CYGNUS-4 // LIVE RADAR</span>
            </div>
            <div>STATUS: ORBIT STABILIZED</div>
            <div className="text-slate-300">TELEMETRY: JDK 21 CHANNELS SYNCHRONIZED</div>
          </div>
        </div>

        {/* Animated Spaceship cruising near Ignis Station (Ship Idle State Animation) */}
        <motion.div
          animate={{
            x: [0, 12, -8, 0],
            y: [0, -10, 6, 0],
            rotate: [-1, 2, -1, -1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute z-20 pointer-events-none motion-reduce:transform-none"
          style={{ left: '26%', top: '48%' }}
        >
          <div className="relative flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-cyber-cyan/20 border border-cyber-cyan shadow-glow-cyan flex items-center justify-center text-cyber-cyan backdrop-blur-sm">
              <Rocket className="w-5 h-5 -rotate-45" />
            </div>
            {/* Engine thruster pulse behind ship */}
            <div className="w-2 h-2 rounded-full bg-cyber-cyan blur-[2px] animate-pulse motion-reduce:hidden -ml-1" />
            <div className="hidden lg:block px-2.5 py-1 rounded-lg bg-space-900/90 border border-cyber-cyan/40 text-[10px] font-mono text-cyber-cyan font-bold tracking-wider shadow-glow-cyan/20">
              VOYAGER-1 (YOU) // IDLE
            </div>
          </div>
        </motion.div>

        {/* Render Worlds 1 to 4 */}
        <div className="relative z-10 w-full h-full min-h-[520px]">
          {worlds.map((world) => {
            const config = WORLD_CONFIGS[world.worldOrder] || WORLD_CONFIGS[1];
            const isIgnis = world.worldOrder === 1;
            const isUnlocked = isIgnis || Boolean(world.unlockedByDefault) || (user?.currentSector != null && user.currentSector >= world.worldOrder);

            return (
              <div
                key={world.id}
                style={{
                  left: `${config.coordinates.x}%`,
                  top: `${config.coordinates.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute flex flex-col items-center group cursor-pointer"
                onClick={() => handleWorldClick(world)}
              >
                {/* Orbital Ring & Planet Glow Effect */}
                <div className="relative flex items-center justify-center">
                  {isUnlocked && (
                    <>
                      {/* Subtle ambient planet atmospheric aura */}
                      <div
                        className="absolute -inset-4 rounded-full blur-xl pointer-events-none opacity-40 transition-opacity group-hover:opacity-75"
                        style={{ backgroundColor: config.glowColor }}
                      />

                      {/* Concentric pulse ring */}
                      <motion.div
                        animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0.15, 0.5] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.25)] pointer-events-none motion-reduce:hidden"
                      />
                    </>
                  )}

                  {/* Planet Disc with Subtle Planetary Rotation */}
                  <motion.div
                    whileHover={{ scale: isUnlocked ? 1.08 : 1.02 }}
                    whileTap={{ scale: isUnlocked ? 0.96 : 1 }}
                    className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-2xl ${
                      isUnlocked
                        ? 'border-amber-400 shadow-glow-amber hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] cursor-pointer'
                        : 'border-slate-700/60 opacity-65 grayscale hover:grayscale-[50%] cursor-not-allowed'
                    }`}
                  >
                    {/* Rotating planetary texture layer */}
                    <motion.img
                      src={config.image}
                      alt={config.name}
                      animate={isUnlocked ? { rotate: 360 } : undefined}
                      transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
                      className="w-full h-full object-cover scale-110 motion-reduce:transform-none"
                    />

                    {/* Dark gradient gloss overlay & atmosphere rim */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-space-950/80 via-transparent to-white/10 pointer-events-none" />

                    {/* Locked World Overlay */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-space-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-slate-400">
                        <Lock className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-[9px] font-mono font-bold tracking-widest uppercase">
                          LOCKED
                        </span>
                      </div>
                    )}

                    {/* Active Sector indicator on Ignis Station */}
                    {isUnlocked && (
                      <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-cyber-emerald shadow-glow-emerald border border-white animate-pulse" />
                    )}
                  </motion.div>
                </div>

                {/* World Label HUD */}
                <div className="mt-3 text-center space-y-1">
                  <div className="flex items-center justify-center space-x-1.5">
                    <span
                      className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                        isUnlocked
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-space-800 text-slate-400 border border-space-700'
                      }`}
                    >
                      {config.code}
                    </span>
                    {isUnlocked ? (
                      <span className="text-[10px] font-mono text-cyber-emerald font-bold">
                        [UNLOCKED]
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-500/80 font-semibold">
                        LOCKED
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-sm sm:text-base font-black font-mono tracking-wider uppercase transition-colors ${
                      isUnlocked
                        ? 'text-white group-hover:text-amber-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {config.name}
                  </h3>

                  <p className="text-[10px] sm:text-xs text-slate-400 font-mono max-w-[160px] line-clamp-1">
                    {config.tagline}
                  </p>

                  {isUnlocked && (
                    <div className="pt-1">
                      <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-cyber-cyan font-bold group-hover:underline">
                        <span>OPEN MISSION MAP</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 sm:left-6 z-10 flex flex-wrap items-center gap-3 p-3 rounded-xl bg-space-900/80 border border-space-800 text-[11px] font-mono text-slate-300 backdrop-blur-md">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-emerald"></span>
            <span>Unlocked Sector</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span>Locked Sector</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span>Current Deployment</span>
          </div>
        </div>
      </div>

      {/* WORLD MODAL (MISSION MAP & DIRECTIVES) */}
      <AnimatePresence>
        {selectedWorld && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-xl"
            onClick={() => setSelectedWorld(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl rounded-3xl glass-panel border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedWorld(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-space-900 text-slate-400 hover:text-white hover:bg-space-800 border border-white/10 transition-colors"
                title="Close Mission Map"
              >
                <X className="w-5 h-5" />
              </button>

              {/* World Header in Modal */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-space-800 pb-5">
                <div className="flex items-center space-x-4">
                  <img
                    src={WORLD_CONFIGS[currentModalWorld?.worldOrder || 1]?.image || ignisImg}
                    alt={currentModalWorld?.name || 'World'}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-glow-amber/40 shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {WORLD_CONFIGS[currentModalWorld?.worldOrder || 1]?.code || 'SECTOR'} // UNLOCKED
                      </span>
                      <span className="text-xs font-mono text-cyber-cyan flex items-center space-x-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{currentModalWorld?.theme || 'Exploration Outpost'}</span>
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-tight mt-1">
                      {currentModalWorld?.name || 'MISSION DIRECTIVES'}
                    </h2>
                    <p className="text-xs text-slate-300 font-mono max-w-xl">
                      {currentModalWorld?.lore || 'Complete all sequenced flight operations to conquer this planetary sector.'}
                    </p>
                  </div>
                </div>

                {/* Status Counter */}
                <div className="flex items-center space-x-4 bg-space-900/80 p-3.5 rounded-2xl border border-space-800 font-mono text-xs">
                  <div>
                    <div className="text-slate-400">CLEARED</div>
                    <div className="text-lg font-bold text-cyber-emerald">
                      {`${processedMissions.filter((m) => m.state === 'completed').length} / ${processedMissions.length || 5}`}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-space-800" />
                  <div>
                    <div className="text-slate-400">TOTAL XP</div>
                    <div className="text-lg font-bold text-amber-400">
                      +{processedMissions.reduce((acc, m) => acc + (m.xpReward || 0), 0) || 700} XP
                    </div>
                  </div>
                </div>
              </div>

              {processedMissions.length === 0 ? (
                <div className="p-8 sm:p-12 text-center rounded-2xl bg-space-900/80 border border-cyber-cyan/40 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-cyber-cyan/15 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan">
                    <Rocket className="w-8 h-8" />
                  </div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan font-mono text-xs font-bold uppercase">
                    <span>SECTOR UNDER SURVEY</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                    DEEP-SPACE MATRIX UNDER RECONNAISSANCE
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-mono max-w-md mx-auto leading-relaxed">
                    Long-range planetary probes are compiling orbital flight coordinates. Clear preceding sectors to unlock warp jumps.
                  </p>
                  <GlowButton
                    variant="secondary"
                    size="md"
                    onClick={() => setSelectedWorld(null)}
                  >
                    RETURN TO GALAXY MAP
                  </GlowButton>
                </div>
              ) : (
                <>
                  {/* Mission Progression Pathway (Horizontal / Responsive Grid) */}
                  <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-cyber-cyan" />
                    <span>MISSION PROGRESSION PIPELINE</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Sequenced Execution Protocol
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {processedMissions.map((mission, idx) => {
                    const isCompleted = mission.state === 'completed';
                    const isCurrent = mission.state === 'current';
                    const isAvailable = mission.state === 'available';
                    const isLocked = mission.state === 'locked';

                    return (
                      <motion.div
                        key={mission.id}
                        whileHover={!isLocked ? { y: -3, transition: { duration: 0.15 } } : undefined}
                        onClick={() => !isLocked && navigate(`/mission/${mission.id}`)}
                        className={`relative rounded-2xl p-4 border flex flex-col justify-between transition-all select-none ${
                          isCurrent
                            ? 'bg-space-900 border-cyber-cyan shadow-[0_0_24px_rgba(0,240,255,0.3)] cursor-pointer ring-1 ring-cyber-cyan'
                            : isAvailable
                            ? 'bg-space-900/90 border-amber-400/60 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer'
                            : isCompleted
                            ? 'bg-space-900/75 border-cyber-emerald/40 hover:border-cyber-emerald shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer'
                            : 'bg-space-950/40 border-space-800 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {/* Subtle Mission-node Pulse on Current & Available */}
                        {isCurrent && (
                          <div className="absolute -inset-0.5 rounded-2xl bg-cyber-cyan/15 blur-[6px] pointer-events-none animate-pulse motion-reduce:hidden" />
                        )}

                        {/* Status Header Badge */}
                        <div className="relative z-10 flex items-center justify-between mb-3">
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              isCurrent
                                ? 'bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/50'
                                : isAvailable
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                : isCompleted
                                ? 'bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40'
                                : 'bg-space-800 text-slate-500'
                            }`}
                          >
                            0{mission.missionOrder}
                          </span>

                          {isCompleted && (
                            <span className="flex items-center space-x-1 text-[10px] font-mono text-cyber-emerald">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>CLEARED</span>
                            </span>
                          )}

                          {isCurrent && (
                            <span className="flex items-center space-x-1 text-[10px] font-mono text-cyber-cyan font-bold">
                              <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping motion-reduce:hidden mr-0.5" />
                              <Play className="w-3 h-3 fill-current" />
                              <span>CURRENT</span>
                            </span>
                          )}

                          {isAvailable && (
                            <span className="flex items-center space-x-1 text-[10px] font-mono text-amber-300 font-semibold">
                              <Sparkles className="w-3 h-3" />
                              <span>AVAILABLE</span>
                            </span>
                          )}

                          {isLocked && (
                            <span className="flex items-center space-x-1 text-[10px] font-mono text-slate-500">
                              <Lock className="w-3 h-3" />
                              <span>LOCKED</span>
                            </span>
                          )}
                        </div>

                        {/* Title & Concept */}
                        <div className="relative z-10 space-y-1.5 flex-1">
                          <h4 className="text-sm font-bold text-white font-mono leading-tight">
                            {mission.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-mono leading-snug">
                            {mission.javaConcept}
                          </p>
                        </div>

                        {/* Mission Action Footer */}
                        <div className="relative z-10 pt-3 mt-3 border-t border-space-800 flex items-center justify-between text-xs font-mono">
                          <span className="text-amber-400 text-[11px]">
                            +{mission.xpReward} XP
                          </span>

                          {!isLocked ? (
                            <span
                              className={`font-semibold flex items-center space-x-0.5 text-[11px] group-hover:underline ${
                                isCurrent
                                  ? 'text-cyber-cyan font-bold'
                                  : isAvailable
                                  ? 'text-amber-300'
                                  : 'text-cyber-emerald'
                              }`}
                            >
                              <span>{isCompleted ? 'REPLAY' : 'LAUNCH'}</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">
                              PASS PREV
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Active Mission Launch Bar */}
              {activeMission && (
                <div className="p-4 sm:p-5 rounded-2xl bg-space-900/90 border border-cyber-cyan/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-glow-cyan/10">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs font-mono text-cyber-cyan font-bold">
                      <Rocket className="w-4 h-4" />
                      <span>NEXT SCHEDULED FLIGHT MISSION</span>
                    </div>
                    <h4 className="text-base font-bold text-white font-mono">
                      Mission 0{activeMission.missionOrder}: {activeMission.title}
                    </h4>
                    <p className="text-xs text-slate-300 font-mono">
                      {activeMission.objective}
                    </p>
                  </div>

                  <GlowButton
                    variant="primary"
                    size="lg"
                    onClick={() => navigate(`/mission/${activeMission.id}`)}
                    icon={<Play className="w-4 h-4 fill-current" />}
                  >
                    LAUNCH MISSION 0{activeMission.missionOrder}
                  </GlowButton>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
