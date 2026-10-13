import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, DashboardSummary } from '../services/authService';
import { GlassCard } from '../components/GlassCard';
import { GlowButton } from '../components/GlowButton';
import { StatCard } from '../components/StatCard';
import { XPBar } from '../components/XPBar';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingState } from '../components/LoadingState';
import {
  Terminal,
  Shield,
  Zap,
  Flame,
  Rocket,
  Award,
  ChevronRight,
  Globe,
  Code2,
  CheckCircle2,
  Lock,
  Compass,
  Sparkles,
  ArrowRight,
  Activity,
  Play,
  BookOpen,
  GitFork,
  GraduationCap
} from 'lucide-react';
import { StarshipReactorHUD } from '../game/StarshipReactorHUD';
import { StarshipVesselView } from '../game/StarshipVesselView';
import { gameStateService, GameState } from '../services/gameStateService';
import ignisImg from '../assets/images/ignis_station.jpg';
import byteImg from '../assets/images/byte_guide.jpg';

interface DashboardProps {
  health?: any;
  loadingHealth?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = () => {
  const { user: authUser, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (isAuthenticated) {
          const [data, gs] = await Promise.all([
            authService.getDashboardSummary(),
            gameStateService.getGameState().catch(() => null),
          ]);
          if (isMounted) {
            setSummary(data);
            if (gs) setGameState(gs);
          }
        }
      } catch (err: any) {
        console.error('Failed to load dashboard summary', err);
        if (isMounted) {
          setError('Unable to link with Starfleet Command Telemetry. Retrying connection...');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const user = summary?.user || authUser;
  const currentLevel = user?.level || 1;
  const rankTitle = summary?.rankTitle || (currentLevel === 1 ? 'CODE APPRENTICE' : 'CADET EXPLORER');
  const currentXp = summary?.currentXp ?? user?.xp ?? 0;
  const nextLevelXp = summary?.nextLevelXp ?? 500;
  const xpPercentage = summary?.xpPercentage ?? Math.min(100, Math.round((currentXp / 500) * 100));

  const currentMissionId = summary?.currentMissionId || 1;
  const currentMissionTitle = summary?.currentMissionTitle || 'Powering the Console';
  const currentMissionWorld = summary?.currentMissionWorldName || 'Ignis Station';
  const currentMissionConcept = summary?.currentMissionConcept || 'Java Basics & Program Structure';
  const currentMissionObjective = summary?.currentMissionObjective || 'Construct a valid Java class named Solution and output the exact diagnostic code: IGNIS STATION: ONLINE';

  if (loading && !summary) {
    return (
      <div className="py-24">
        <LoadingState message="INTERFACING WITH STARFLEET COMMAND CENTER..." />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Top Banner / Welcome Cadet */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-cyber-cyan/30 shadow-glow-cyan/20 p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono">
              <Rocket className="w-3.5 h-3.5" />
              <span>STARFLEET COMMAND CENTER // ACTIVE TELEMETRY</span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-widest text-cyber-cyan/80">
                STARFLEET ID: CADET-{user?.id || 101}
              </p>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase font-mono">
                WELCOME BACK,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-blue-400 to-cyber-purple">
                  CADET {user?.username || 'EXPLORER'}
                </span>
              </h1>
            </div>

            {/* Rank and XP Sub-Bar Display */}
            <div className="p-4 rounded-2xl bg-space-900/80 border border-space-700/60 max-w-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-cyber-cyan/20 text-cyber-cyan text-xs font-mono font-bold">
                    LEVEL {currentLevel}
                  </span>
                  <span className="text-xs font-mono font-bold tracking-wider text-slate-200">
                    {rankTitle}
                  </span>
                </div>
                <div className="text-xs font-mono text-cyber-cyan">
                  <span className="text-white font-bold">{currentXp}</span> / {nextLevelXp} XP
                </div>
              </div>

              {/* Graphical ASCII & Modern XP bar */}
              <div className="space-y-2">
                <ProgressBar
                  value={currentXp % 500}
                  max={500}
                  color="cyan"
                  size="sm"
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span className="text-cyber-cyan/70 font-mono tracking-widest">
                  [████████████░░░]
                </span>
                <span>{Math.round(xpPercentage)}% TO NEXT LEVEL PROMOTION</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <GlowButton
                variant="primary"
                size="lg"
                onClick={() => navigate(`/mission/${currentMissionId}`)}
                icon={<Play className="w-4 h-4 fill-current" />}
              >
                CONTINUE ADVENTURE
              </GlowButton>

              <GlowButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/language-selection')}
                icon={<Code2 className="w-4 h-4 text-cyber-cyan" />}
              >
                TRACK: {user?.selectedLanguage || 'JAVA'}
              </GlowButton>

              <GlowButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/skills')}
                icon={<GitFork className="w-4 h-4 text-cyber-purple rotate-180" />}
              >
                SKILL TREE
              </GlowButton>

              <GlowButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/codex')}
                icon={<BookOpen className="w-4 h-4 text-amber-400" />}
              >
                JAVA CODEX
              </GlowButton>

              <GlowButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/evaluation')}
                icon={<GraduationCap className="w-4 h-4 text-amber-400" />}
              >
                PRE / POST TEST
              </GlowButton>

              <GlowButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/sectors')}
                icon={<Compass className="w-4 h-4 text-cyber-purple" />}
              >
                GALAXY MAP
              </GlowButton>
            </div>
          </div>

          {/* Byte Robot Companion Widget */}
          <div className="lg:col-span-4">
            <GlassCard glow="cyan" className="p-5 border-cyber-cyan/30">
              <div className="flex items-start space-x-4">
                <img
                  src={byteImg}
                  alt="Byte Flight Companion"
                  className="w-16 h-16 rounded-2xl object-cover border border-cyber-cyan shadow-glow-cyan/50 shrink-0"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white font-mono">Byte Companion</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-emerald/20 text-cyber-emerald font-mono">ONLINE</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    "Sensors indicate pending calibrations in {currentMissionWorld}. Ready to execute Mission {currentMissionId} code, Cadet?"
                  </p>
                  <div className="pt-1">
                    <span className="text-[10px] text-cyber-cyan font-mono flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>JDK 21 Sandbox Operational</span>
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Starship Subsystem & Vessel Progression — Dynamic Connection between Java Learning and Ship Systems */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyber-cyan">
            <Activity className="w-4 h-4" />
            <span className="tracking-wider uppercase font-bold">STARSHIP VESSEL PROGRESSION // REAL-TIME JAVA LINK</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Ship Hull: <strong className="text-white">{gameState?.activeShipName || 'USS Vanguard'}</strong> ({gameState?.overallIntegrity ?? 40}% Restored)
          </span>
        </div>

        {/* Visual Starship Hull Blueprint with Lights, Conduits, Radar, Screens & Flight States */}
        <StarshipVesselView
          gameState={gameState}
          showControls={true}
        />

        {/* Primary Reactor Subsystem HUD */}
        <StarshipReactorHUD
          systemKey="POWER_CORE"
          systemStatus={gameState?.systems?.find((s) => s.systemKey === 'POWER_CORE')}
          overallIntegrity={gameState?.overallIntegrity ?? 40}
          shipName={gameState?.activeShipName || 'USS Vanguard (NCC-1701)'}
        />

        {/* All Subsystems Matrix Grid */}
        {gameState?.systems && gameState.systems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
            {gameState.systems.map((sys) => {
              const isFull = sys.powerPercentage >= 100;
              const isPartial = sys.powerPercentage >= 60;
              const isDamaged = sys.powerPercentage > 0;

              return (
                <div
                  key={sys.systemKey}
                  className={`p-3 rounded-xl border text-xs font-mono space-y-2 transition-all ${
                    isFull
                      ? 'bg-space-900/80 border-cyber-cyan/40 shadow-glow-cyan/10'
                      : isPartial
                      ? 'bg-space-900/60 border-amber-500/40'
                      : isDamaged
                      ? 'bg-space-950/70 border-rose-500/40'
                      : 'bg-space-950/40 border-space-850 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase truncate">
                      {sys.javaConcept}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        isFull
                          ? 'bg-cyber-cyan/20 text-cyber-cyan'
                          : isPartial
                          ? 'bg-amber-500/20 text-amber-300'
                          : isDamaged
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-space-900 text-slate-500'
                      }`}
                    >
                      {sys.powerPercentage}%
                    </span>
                  </div>

                  <h5 className="font-bold text-white text-[11px] truncate">
                    {sys.displayName}
                  </h5>

                  {/* 8-block mini-bar */}
                  <div className="grid grid-cols-8 gap-0.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-xs ${
                          i < Math.round((sys.powerPercentage / 100) * 8)
                            ? isFull
                              ? 'bg-cyber-cyan'
                              : isPartial
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                            : 'bg-space-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Main Mission Control HUD Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Current Mission & Continue Adventure */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyber-cyan">
            <Terminal className="w-4 h-4" />
            <span className="tracking-wider uppercase font-bold">CURRENT ACTIVE MISSION</span>
          </div>

          <GlassCard glow="cyan" className="p-6 border-cyber-cyan/40 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-space-800 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold tracking-wider">
                  MISSION 0{currentMissionId} // {currentMissionWorld}
                </span>
                <h2 className="text-2xl font-black text-white font-mono mt-0.5">
                  {currentMissionTitle}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-space-800 border border-space-700 text-xs font-mono text-cyber-cyan">
                  {currentMissionConcept}
                </span>
                <span className="px-2 py-0.5 rounded bg-cyber-emerald/20 text-cyber-emerald text-[11px] font-mono">
                  ACTIVE
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">DIRECTIVE OBJECTIVE:</p>
              <p className="text-sm text-slate-200 font-mono leading-relaxed bg-space-950/60 p-3.5 rounded-xl border border-space-800">
                {currentMissionObjective}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4 text-xs font-mono text-slate-300">
                <span className="flex items-center space-x-1 text-amber-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>+100 XP REWARD</span>
                </span>
                <span className="flex items-center space-x-1 text-cyber-cyan">
                  <Award className="w-3.5 h-3.5" />
                  <span>3 STARS AVAILABLE</span>
                </span>
              </div>

              <GlowButton
                variant="primary"
                size="md"
                onClick={() => navigate(`/mission/${currentMissionId}`)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                [CONTINUE MISSION]
              </GlowButton>
            </div>
          </GlassCard>

          {/* Recent Missions Telemetry */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <Activity className="w-4 h-4 text-cyber-purple" />
                <span className="uppercase font-bold tracking-wider">SECTOR 01 RECENT MISSIONS</span>
              </div>
              <Link
                to="/sectors"
                className="text-xs font-mono text-cyber-cyan hover:underline flex items-center space-x-1"
              >
                <span>View Galaxy Chart</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {(summary?.recentMissions || []).map((m) => (
                <div
                  key={m.id}
                  onClick={() => m.unlocked && navigate(`/mission/${m.id}`)}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    m.completed
                      ? 'bg-space-900/60 border-cyber-emerald/30 hover:border-cyber-emerald/60'
                      : m.unlocked
                      ? 'bg-space-900/80 border-cyber-cyan/30 hover:border-cyber-cyan/70 shadow-glow-cyan/10'
                      : 'bg-space-950/40 border-space-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                        m.completed
                          ? 'bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40'
                          : m.unlocked
                          ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
                          : 'bg-space-800 text-slate-500'
                      }`}
                    >
                      0{m.missionOrder}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white font-mono">{m.title}</h4>
                        {m.completed && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyber-emerald/20 text-cyber-emerald font-mono flex items-center space-x-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>CLEARED</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{m.concept}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {m.unlocked ? (
                      <span className="text-xs font-mono text-cyber-cyan flex items-center space-x-1">
                        <span>{m.completed ? 'REPLAY' : 'LAUNCH'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-500 flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>LOCKED</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Learning Progress, World Progress, Stars & Achievements */}
        <div className="lg:col-span-5 space-y-6">
          {/* Learning Progress & World Progress */}
          <GlassCard glow="purple" className="p-6 border-cyber-purple/30 space-y-5">
            <div className="flex items-center justify-between border-b border-space-800 pb-3">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  LEARNING TELEMETRY
                </h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
                {user?.selectedLanguage || 'JAVA 21'}
              </span>
            </div>

            {/* Java Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">JAVA CURRICULUM</span>
                <span className="text-cyber-cyan font-bold">
                  {summary?.completedMissionsCount || 0} / {summary?.totalJavaMissions || 5} MISSIONS (
                  {Math.round(summary?.javaProgressPercent || 0)}%)
                </span>
              </div>
              <ProgressBar
                value={summary?.javaProgressPercent || 0}
                max={100}
                color="cyan"
                size="md"
              />
            </div>

            {/* World Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">SECTOR EXPLORATION</span>
                <span className="text-cyber-purple font-bold">
                  {summary?.unlockedWorldsCount || 1} / {summary?.totalWorlds || 1} SECTORS (
                  {Math.round(summary?.worldProgressPercent || 100)}%)
                </span>
              </div>
              <ProgressBar
                value={summary?.worldProgressPercent || 100}
                max={100}
                color="purple"
                size="md"
              />
            </div>

            {/* Flight Stars Metric */}
            <div className="p-3.5 rounded-xl bg-space-950/70 border border-space-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-400">MISSION STARS COLLECTED</div>
                  <div className="text-lg font-bold font-mono text-amber-300">
                    {summary?.totalStarsEarned || user?.stars || 0} / {summary?.maxAvailableStars || 15} STARS
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-amber-400/80">3★ SYSTEM</span>
            </div>
          </GlassCard>

          {/* Achievements Summary */}
          <GlassCard glow="cyan" className="p-6 border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-space-800 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  STARFLEET COMMENDATIONS
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {summary?.unlockedAchievementsCount || 0} / {summary?.totalAchievementsCount || 4} UNLOCKED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(summary?.recentAchievements || []).map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border transition-all ${
                    ach.unlocked
                      ? 'bg-space-900/80 border-cyber-cyan/40 shadow-glow-cyan/10'
                      : 'bg-space-950/40 border-space-800 opacity-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Award
                      className={`w-4 h-4 ${
                        ach.unlocked ? 'text-cyber-cyan' : 'text-slate-600'
                      }`}
                    />
                    <span className="text-xs font-bold font-mono text-white truncate">
                      {ach.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono line-clamp-2 leading-tight">
                    {ach.description}
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-amber-400">
                    +{ach.xpReward} XP
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/achievements"
              className="w-full block text-center py-2 rounded-xl bg-space-800/80 hover:bg-space-800 border border-space-700 text-xs font-mono text-cyber-cyan transition-colors"
            >
              VIEW ALL BADGES & COMMENDATIONS →
            </Link>
          </GlassCard>

          {/* Language Track Shortcut */}
          <GlassCard className="p-5 border-space-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-mono">Learning Track: Java</h4>
                <p className="text-xs text-slate-400 font-mono">Build Strong Foundations</p>
              </div>
            </div>
            <GlowButton
              variant="secondary"
              size="sm"
              onClick={() => navigate('/language-selection')}
            >
              CHANGE TRACK
            </GlowButton>
          </GlassCard>
        </div>
      </section>

      {/* Cadet Flight Stats Overview Bottom Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Cadet Level"
          value={`LVL ${user?.level || 1}`}
          subtitle={rankTitle}
          icon={Shield}
          color="cyan"
        />
        <StatCard
          title="Total Flight XP"
          value={`${user?.xp || 0} XP`}
          subtitle={`${Math.max(0, nextLevelXp - currentXp)} XP to Level ${currentLevel + 1}`}
          icon={Zap}
          color="amber"
        />
        <StatCard
          title="Cadet Flight Streak"
          value={`${user?.streak || 1} Days`}
          subtitle="Continuous calibration"
          icon={Flame}
          color="purple"
        />
        <StatCard
          title="Stars Awarded"
          value={`${user?.stars || 0} Stars`}
          subtitle={`${summary?.completedMissionsCount || 0} Missions Completed`}
          icon={Award}
          color="emerald"
        />
      </section>
    </div>
  );
};
