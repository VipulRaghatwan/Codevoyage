import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { missionService, MissionDetail, ExecutionSandboxResponse } from '../services/missionService';
import { useAuth } from '../context/AuthContext';
import { JavaCodeEditor } from '../editor/JavaCodeEditor';
import { GlassCard } from '../components/GlassCard';
import { GlowButton } from '../components/GlowButton';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingState } from '../components/LoadingState';
import {
  Rocket,
  Shield,
  Zap,
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Code2,
  BookOpen,
  Award,
  ChevronRight,
  Flame,
  Clock,
  Check,
  Star
} from 'lucide-react';

import ignisImg from '../assets/images/ignis_station.jpg';
import byteImg from '../assets/images/byte_guide.jpg';
import fleetHangarImg from '../assets/images/fleet_hangar.jpg';
import { RobotCompanion, CompanionMood } from '../game/RobotCompanion';
import { getByteDialogue } from '../game/ByteDialogueSystem';
import { GameCelebrationModal } from '../game/GameCelebrationModal';
import { ConceptEngine } from '../components/ConceptEngine';
import { InteractiveActivityCard } from '../components/InteractiveActivityEngine';
import { StarshipReactorHUD } from '../game/StarshipReactorHUD';
import { StarshipVesselView } from '../game/StarshipVesselView';
import { MissionHUD } from '../game/MissionHUD';
import { gameStateService, GameState } from '../services/gameStateService';
import {
  PowerCoreRepairGame,
  CommunicationRepairGame,
  EngineCalibrationGame,
  NavigationInterlockGame,
} from '../game/ConceptMiniGames';
import {
  MissionIntroCinematic,
  CodeRunningCinematic,
  PlanetUnlockCinematic,
  BossDefeatedCinematic,
} from '../game/CinematicTransitions';
import { soundManager } from '../services/soundService';

type MissionStage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface StageConfig {
  number: MissionStage;
  title: string;
  tag: string;
}

const STAGES: StageConfig[] = [
  { number: 1, title: 'STORY', tag: 'Directive Introduction' },
  { number: 2, title: 'LEARN', tag: 'Concept Telemetry' },
  { number: 3, title: 'PRACTICE', tag: 'Knowledge Verification' },
  { number: 4, title: 'CODING CHALLENGE', tag: 'Mission Objective' },
  { number: 5, title: 'RUN', tag: 'Sandbox Compilation' },
  { number: 6, title: 'TEST', tag: 'Test Case Analysis' },
  { number: 7, title: 'RESULT', tag: 'Flight Clearance' },
];

export const MissionExperience: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const missionId = parseInt(id || '1', 10);
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [mission, setMission] = useState<MissionDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStage, setCurrentStage] = useState<MissionStage>(1);

  // Stage 3 Practice states
  const [practiceAnswers, setPracticeAnswers] = useState<{ [key: number]: number }>({});
  const [practiceFeedback, setPracticeFeedback] = useState<{ [key: number]: boolean }>({});
  const [practiceSubmitted, setPracticeSubmitted] = useState<boolean>(false);

  // Stage 4/5/6 Coding & Execution states
  const [code, setCode] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [hintsUnlocked, setHintsUnlocked] = useState<number[]>([]);
  const [savingProgress, setSavingProgress] = useState<boolean>(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const [showIntroBriefing, setShowIntroBriefing] = useState<boolean>(true);
  const [showPlanetUnlock, setShowPlanetUnlock] = useState<boolean>(false);
  const [showBossVictory, setShowBossVictory] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Dynamic Contextual Robot Companion Logic powered by ByteDialogueSystem
  const companionDialogue = useMemo<{ message: string; subtext?: string; mood: CompanionMood; codeHint?: string }>(() => {
    if (!mission) {
      return {
        message: 'Establishing neural link with station mainframe...',
        mood: 'idle',
      };
    }

    // Stage 3 Practice specific reactions
    if (currentStage === 3) {
      const answeredCount = Object.keys(practiceAnswers).length;
      const totalCount = mission.practiceQuestions?.length || 0;
      if (answeredCount < totalCount) {
        return {
          message: `Diagnostic verification active: ${answeredCount} of ${totalCount} questions analyzed.`,
          subtext: 'Take your time, Cadet. Starfleet rewards precision over haste.',
          mood: 'analyzing',
        };
      }
      return {
        message: 'Excellent! Knowledge verification simulations cleared!',
        subtext: 'The subsystem is responsive. Click "Enter Coding Challenge" to write live Java 21 code.',
        mood: 'celebrating',
      };
    }

    // Stage 6 Results / Error translations
    if (currentStage === 6) {
      if (submissionResult?.completed) {
        return getByteDialogue({
          missionOrder: mission.missionOrder,
          stage: 7,
        });
      }
      if (submissionResult?.status === 'COMPILE_ERROR') {
        return getByteDialogue({
          compilerError: submissionResult?.stderr || submissionResult?.diagnosticHint || 'Syntax error',
        });
      }
      if (submissionResult && !submissionResult.completed) {
        return getByteDialogue({
          testPassed: false,
        });
      }
    }

    return getByteDialogue({
      missionOrder: mission.missionOrder,
      stage: currentStage,
    });
  }, [currentStage, mission, practiceAnswers, submissionResult]);

  useEffect(() => {
    let isMounted = true;
    const loadMission = async () => {
      try {
        setLoading(true);
        // Reset stage and interaction states for new mission
        setCurrentStage(1);
        setPracticeAnswers({});
        setPracticeFeedback({});
        setPracticeSubmitted(false);
        setSubmissionResult(null);
        setHintsUnlocked([]);
        setShowCelebrationModal(false);
        setShowIntroBriefing(true);
        setShowPlanetUnlock(false);
        setShowBossVictory(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const data = await missionService.getMissionById(missionId);
        if (isMounted) {
          setMission(data);
          if (data.codingChallenge) {
            setCode(data.codingChallenge.starterCode);
          }
        }
        try {
          const gs = await gameStateService.getGameState();
          if (isMounted) setGameState(gs);
        } catch {
          // Non-blocking
        }
      } catch (err) {
        console.error('Failed to load mission', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMission();
    return () => {
      isMounted = false;
    };
  }, [missionId]);

  const refreshGameState = async () => {
    try {
      const gs = await gameStateService.getGameState();
      setGameState(gs);
    } catch {
      // Non-blocking
    }
  };

  // Stage 3 answer selection
  const handleSelectPracticeAnswer = (qId: number, optionIdx: number, correctIdx: number) => {
    setPracticeAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    setPracticeFeedback((prev) => ({ ...prev, [qId]: optionIdx === correctIdx }));
  };

  const isPracticeComplete = useMemo(() => {
    if (!mission?.practiceQuestions || mission.practiceQuestions.length === 0) return true;
    return mission.practiceQuestions.every((q) => practiceAnswers[q.id] !== undefined);
  }, [mission, practiceAnswers]);

  // Run Code (Trial Run via Spring Boot -> Execution Service -> Sandbox)
  const handleRunCode = async () => {
    if (!mission) return;
    setIsExecuting(true);
    setCurrentStage(5); // STAGE 5 — RUN

    try {
      const res = await missionService.runCode(mission.id, code);
      setSubmissionResult(res);

      setTimeout(() => {
        setCurrentStage(6); // STAGE 6 — TEST
        setIsExecuting(false);
      }, 1300);
    } catch (err: any) {
      setIsExecuting(false);
      setSubmissionResult({
        status: 'RUNTIME_ERROR',
        success: false,
        completed: false,
        stdout: '',
        stderr: err?.message || 'Failed to contact Starfleet execution telemetry.',
        executionTimeMs: 0,
        diagnosticHint: 'Network connection or backend communication fault.',
        testCases: [],
      });
      setCurrentStage(6);
    }
  };

  // Submit Code (Official Flight Submission via Spring Boot with server-side validation & rewards)
  const handleSubmitCode = async () => {
    if (!mission) return;
    setIsExecuting(true);
    setCurrentStage(5); // STAGE 5 — RUN

    try {
      const res = await missionService.submitCode(mission.id, code);
      setSubmissionResult(res);

      setTimeout(async () => {
        setCurrentStage(6); // STAGE 6 — TEST
        setIsExecuting(false);

        if (res.completed) {
          soundManager.emit('test_passed');
          if (mission.shipSystem) {
            try {
              await gameStateService.updateSystemPower(mission.shipSystem, 100);
            } catch {
              // Non-blocking
            }
          }
          await refreshUser();
          await refreshGameState();
          // If Boss Mission (Mission 5) is cleared, trigger Boss Victory sequence first, then Planet Unlock!
          if (mission.isBossMission || mission.missionOrder === 5) {
            setShowBossVictory(true);
          } else {
            setShowCelebrationModal(true);
          }
        } else {
          soundManager.emit('test_failed');
        }
      }, 1400);
    } catch (err: any) {
      soundManager.emit('test_failed');
      setIsExecuting(false);
      setSubmissionResult({
        status: 'RUNTIME_ERROR',
        success: false,
        completed: false,
        stdout: '',
        stderr: err?.message || 'Submission verification failed.',
        executionTimeMs: 0,
        diagnosticHint: 'Transmission fault during mission submission.',
        testCases: [],
      });
      setCurrentStage(6);
    }
  };

  const handleUnlockHint = async (hintId: number) => {
    if (!hintsUnlocked.includes(hintId)) {
      setHintsUnlocked((prev) => [...prev, hintId]);
      if (mission) {
        try {
          await missionService.unlockHint(mission.id, hintId);
        } catch (err) {
          console.error('Failed to register hint usage', err);
        }
      }
    }
  };

  if (loading && !mission) {
    return (
      <div className="py-32">
        <LoadingState message="INITIALIZING FLIGHT COCKPIT TELEMETRY..." />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="text-center py-24 space-y-4">
        <div className="text-rose-400 font-mono text-base">MISSION DATA STREAM SEVERED</div>
        <p className="text-xs text-slate-400 font-mono">Unable to retrieve parameters for Mission {missionId}.</p>
        <GlowButton variant="secondary" size="md" onClick={() => navigate('/map')}>
          RETURN TO GALAXY MAP
        </GlowButton>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Reusable Mission HUD displaying World, Mission, Objective, Progress, XP, Stars, and Java concept */}
      <MissionHUD
        worldName={mission.worldName || 'IGNIS STATION'}
        missionOrder={mission.missionOrder}
        missionTitle={mission.title}
        javaConcept={mission.javaConcept}
        xpReward={mission.xpReward || 100}
        starsReward={3}
        starsEarned={submissionResult?.starsEarned || (mission.completed ? 3 : 0)}
        currentStage={currentStage}
        isPracticeComplete={isPracticeComplete}
        isCodePassed={Boolean(submissionResult?.completed)}
        onBackToMap={() => navigate('/map')}
      />

      {/* 7-Stage Gamified Stepper Bar */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 p-2 rounded-2xl bg-space-950/90 border border-white/10 backdrop-blur-md">
        {STAGES.map((s) => {
          const isActive = currentStage === s.number;
          const isPassed = currentStage > s.number;

          return (
            <button
              key={s.number}
              onClick={() => {
                // Cadets can navigate back to earlier stages or advance if permitted
                if (s.number <= currentStage || (s.number === 4 && isPracticeComplete)) {
                  setCurrentStage(s.number);
                }
              }}
              className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                isActive
                  ? 'bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan shadow-glow-cyan/30'
                  : isPassed
                  ? 'bg-space-900 border border-cyber-emerald/40 text-cyber-emerald hover:bg-space-850'
                  : 'bg-space-950/40 border border-transparent text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-1 text-[10px] sm:text-xs font-mono font-bold">
                {isPassed ? (
                  <Check className="w-3 h-3 text-cyber-emerald" />
                ) : (
                  <span>0{s.number}</span>
                )}
                <span className="hidden md:inline uppercase">{s.title}</span>
              </div>
            </button>
          );
        })}
      </div>
      {/* Starship Reactor HUD — Connecting Java Learning to Game Subsystems */}
      {mission && (
        <StarshipReactorHUD
          systemKey={mission.shipSystem || 'POWER_CORE'}
          systemStatus={gameState?.systems?.find(
            (s) => s.systemKey === (mission.shipSystem || 'POWER_CORE')
          )}
          overallIntegrity={gameState?.overallIntegrity ?? 40}
          shipName={gameState?.activeShipName || 'USS Vanguard (NCC-1701)'}
          interactivePowerOverride={
            (mission.isBossMission || mission.missionOrder === 5)
              ? (currentStage === 7 || mission.completed || submissionResult?.completed ? 100 : 18)
              : (currentStage === 7 || mission.completed
                  ? 100
                  : currentStage >= 4
                  ? 60
                  : currentStage >= 2
                  ? 25
                  : undefined)
          }
        />
      )}

      {/* B.Y.T.E. Robot Tactical Guide Companion */}
      <RobotCompanion
        message={companionDialogue.message}
        subtext={companionDialogue.subtext}
        mood={companionDialogue.mood}
        codeHint={companionDialogue.codeHint}
      />

      {/* ---------------------------------------------------------------- */}
      {/* STAGE 1 — STORY (Cinematic Introduction) */}
      {/* ---------------------------------------------------------------- */}
      {currentStage === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="relative rounded-3xl overflow-hidden glass-panel border border-amber-500/40 shadow-glow-amber/20 min-h-[460px] flex flex-col justify-between p-6 sm:p-10">
            {/* Cinematic background backdrop */}
            <div className="absolute inset-0 z-0">
              <img
                src={ignisImg}
                alt="Ignis Station Core"
                className="w-full h-full object-cover opacity-25 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/80 to-transparent" />
            </div>

            {/* Top Alert Badge */}
            <div className="relative z-10 space-y-2">
              {(mission.isBossMission || mission.missionOrder === 5) ? (
                <>
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-600/20 border border-rose-500 text-rose-400 text-xs font-mono font-bold animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>CRITICAL STARFLEET ALERT // BOSS CHALLENGE</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 backdrop-blur-md max-w-xl space-y-1">
                    <div className="text-xs font-mono font-bold text-rose-300 tracking-wider">
                      REACTOR FAILURE IMMINENT
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
                      CORE POWER: 18%
                    </div>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight leading-tight uppercase max-w-2xl">
                    "CADET, EVERYTHING YOU'VE LEARNED SO FAR IS REQUIRED."
                  </h2>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs font-mono animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>INCOMING STARFLEET DISTRESS CALL // SECTOR 01</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight leading-tight uppercase max-w-2xl">
                    "CADET, THE SHIP'S POWER SYSTEM HAS FAILED."
                  </h2>
                </>
              )}
            </div>

            {/* Byte Companion Live Dispatch */}
            <div className="relative z-10 my-6 max-w-3xl p-5 rounded-2xl bg-space-900/90 border border-cyber-cyan/40 shadow-glow-cyan/20 flex items-start space-x-4 backdrop-blur-xl">
              <img
                src={byteImg}
                alt="Byte AI Companion"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-cyber-cyan shadow-glow-cyan shrink-0"
              />
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white font-mono">Byte AI // Cadet Navigator</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyber-emerald/20 text-cyber-emerald font-mono">LINKED</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">
                  "{mission.story}"
                </p>
                <div className="pt-1 text-xs text-cyber-cyan font-mono flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {(mission.isBossMission || mission.missionOrder === 5)
                      ? "Synthesize Java basics, variables, input, operators, and conditions into a unified containment program."
                      : "Before we can launch, you need to understand how Java programs communicate with the console."}
                  </span>
                </div>
              </div>
            </div>

            {/* Begin Mission CTA */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-space-800">
              <div className="text-xs font-mono text-slate-400">
                DIRECTIVE: <span className="text-white font-bold">{mission.objective}</span>
              </div>

              <GlowButton
                variant="primary"
                size="lg"
                onClick={() => setCurrentStage(2)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                BEGIN MISSION
              </GlowButton>
            </div>
          </div>
        </motion.div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* STAGE 2 — LEARN (Interactive Concept Briefing with ConceptEngine) */}
      {/* ---------------------------------------------------------------- */}
      {currentStage === 2 && mission.lesson && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <ConceptEngine
            lesson={mission.lesson}
            conceptTitle={mission.javaConcept}
            worldName={mission.worldName}
            onProceedToPractice={async () => {
              try {
                const res = await missionService.completeLesson(mission.id);
                if (res.xpEarned > 0) {
                  await refreshUser();
                }
              } catch {
                // Non-blocking
              }
              setCurrentStage(3);
            }}
            onBackToStory={() => setCurrentStage(1)}
          />
        </motion.div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* STAGE 3 — PRACTICE (Interactive Exercises with Instant Feedback) */}
      {/* ---------------------------------------------------------------- */}
      {currentStage === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <GlassCard glow="purple" className="p-6 sm:p-8 border-cyber-purple/40 space-y-6">
            <div className="flex items-center justify-between border-b border-space-800 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyber-purple font-bold tracking-wider uppercase">
                  STAGE 3 // KNOWLEDGE VERIFICATION DRILL
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-mono">
                  Station Diagnostics Check
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {mission.practiceQuestions?.length || 0} Questions
              </span>
            </div>

            {/* Concept-Linked Interactive Mini-Game Reinforcement */}
            <div className="space-y-3 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyber-cyan uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>TACTICAL REINFORCEMENT MINI-GAME</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Concept: {mission.javaConcept}
                </span>
              </div>

              {mission.missionOrder === 2 && (
                <PowerCoreRepairGame
                  onComplete={() => {
                    refreshGameState();
                  }}
                />
              )}

              {mission.missionOrder === 3 && (
                <CommunicationRepairGame
                  onComplete={() => {
                    refreshGameState();
                  }}
                />
              )}

              {mission.missionOrder === 4 && (
                <EngineCalibrationGame
                  onComplete={() => {
                    refreshGameState();
                  }}
                />
              )}

              {mission.missionOrder === 5 && (
                <NavigationInterlockGame
                  onComplete={() => {
                    refreshGameState();
                  }}
                />
              )}
            </div>

            <div className="pt-2 border-t border-space-800">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-4">
                PRACTICE VERIFICATION QUESTIONS ({mission.practiceQuestions?.length || 0}):
              </span>
            </div>

            <div className="space-y-6">
              {(mission.practiceQuestions || []).map((q, idx) => (
                <InteractiveActivityCard
                  key={q.id}
                  question={q}
                  index={idx}
                  totalQuestions={mission.practiceQuestions?.length || 0}
                  isResolved={practiceAnswers[q.id] !== undefined}
                  wasCorrect={practiceFeedback[q.id] === true}
                  onAnswerResolved={(questionId, isCorrect) => {
                    if (isCorrect) {
                      soundManager.emit('correct_answer');
                    } else {
                      soundManager.emit('incorrect_answer');
                    }
                    setPracticeAnswers((prev) => ({ ...prev, [questionId]: isCorrect ? 1 : 0 }));
                    setPracticeFeedback((prev) => ({ ...prev, [questionId]: isCorrect }));
                  }}
                />
              ))}
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-space-800">
              <GlowButton
                variant="secondary"
                size="md"
                onClick={() => setCurrentStage(2)}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                BACK TO LEARN
              </GlowButton>

              <GlowButton
                variant="primary"
                size="md"
                disabled={!isPracticeComplete}
                onClick={async () => {
                  try {
                    const res = await missionService.completePractice(mission.id);
                    if (res.xpEarned > 0) {
                      await refreshUser();
                    }
                  } catch {
                    // Non-blocking
                  }

                  if (mission.shipSystem) {
                    try {
                      await gameStateService.updateSystemPower(mission.shipSystem, 60);
                      await refreshGameState();
                    } catch {
                      // Non-blocking
                    }
                  }
                  setCurrentStage(4);
                }}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {isPracticeComplete ? 'ENTER CODING CHALLENGE' : 'COMPLETE ALL QUESTIONS FIRST'}
              </GlowButton>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* STAGE 4 / 5 / 6 — CODING CHALLENGE, RUN & TEST (Integrated Cockpit) */}
      {/* ---------------------------------------------------------------- */}
      {(currentStage === 4 || currentStage === 5 || currentStage === 6) && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Mission Directive, Constraints, and Hints */}
            <div className="lg:col-span-5 space-y-5">
              <GlassCard glow="cyan" className="p-6 border-cyber-cyan/40 space-y-4">
                <div className="flex items-center justify-between border-b border-space-800 pb-2">
                  <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>MISSION OBJECTIVE SPECIFICATION</span>
                  </div>
                  <Link
                    to="/codex"
                    target="_blank"
                    className="text-[11px] font-mono text-cyber-cyan hover:underline flex items-center space-x-1"
                    title="Open Java Codex revision guide"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>JAVA CODEX &rarr;</span>
                  </Link>
                </div>

                <h3 className="text-xl font-bold text-white font-mono">
                  {mission.codingChallenge?.title || 'Flight Diagnostics'}
                </h3>

                <div className="p-3.5 rounded-xl bg-space-950 border border-space-800 font-mono text-xs text-slate-200 leading-relaxed">
                  {mission.codingChallenge?.instructions || mission.objective}
                </div>

                {/* Expected Output Specification */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    TARGET TERMINAL OUTPUT:
                  </span>
                  <div className="p-3 rounded-xl bg-space-900 border border-cyber-cyan/30 font-mono text-xs text-cyber-cyan">
                    {mission.codingChallenge?.visibleTestCases?.[0]?.expectedOutput || 'IGNIS STATION: ONLINE'}
                  </div>
                </div>

                {/* Hints System */}
                <div className="space-y-2 pt-2 border-t border-space-800">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 uppercase">SUB-SPACE HINTS</span>
                    <span className="text-amber-400">Available: {mission.codingChallenge?.hints?.length || 0}</span>
                  </div>

                  {(mission.codingChallenge?.hints || []).map((h) => {
                    const isUnlocked = hintsUnlocked.includes(h.id);
                    return (
                      <div
                        key={h.id}
                        className="p-3 rounded-xl bg-space-950 border border-space-800 text-xs font-mono"
                      >
                        {isUnlocked ? (
                          <div className="space-y-1">
                            <span className="text-amber-400 font-bold">Hint #{h.hintOrder}:</span>
                            <p className="text-slate-300">{h.content}</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Hint #{h.hintOrder} (Locked)</span>
                            <button
                              onClick={() => handleUnlockHint(h.id)}
                              className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]"
                            >
                              REQUEST HINT
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Stage 6: Test Results Window (Visible Test Cases & Masked Hidden Cases) */}
              {currentStage === 6 && (
                <GlassCard glow="emerald" className="p-6 border-cyber-emerald/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-space-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-cyber-emerald" />
                      <span className="text-xs font-mono font-bold text-white uppercase">
                        STAGE 6 // TEST SUITE ANALYSIS
                      </span>
                    </div>
                    {submissionResult && (
                      <span className="text-[11px] font-mono text-cyber-cyan">
                        {submissionResult.passedTests} / {submissionResult.totalTests} Passed
                      </span>
                    )}
                  </div>

                  {/* Diagnostic Alert Box for Compilation or Runtime Errors */}
                  {submissionResult?.diagnosticHint && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs font-mono space-y-1 ${
                        submissionResult.completed
                          ? 'bg-cyber-emerald/10 border-cyber-emerald/40 text-cyber-emerald'
                          : submissionResult.status === 'COMPILE_ERROR'
                          ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                          : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2 font-bold">
                        {submissionResult.completed ? (
                          <Check className="w-4 h-4 text-cyber-emerald" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                        <span>
                          {submissionResult.status === 'COMPILE_ERROR'
                            ? `COMPILER DIAGNOSTIC ${submissionResult.errorLine ? `[LINE ${submissionResult.errorLine}]` : ''}`
                            : submissionResult.status === 'TIMEOUT'
                            ? 'FLIGHT TELEMETRY TIMEOUT'
                            : submissionResult.completed
                            ? 'ALL DIRECTIVES CLEARED'
                            : 'FLIGHT COMPUTER NOTICE'}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90 pl-6">
                        {submissionResult.diagnosticHint}
                      </p>
                    </div>
                  )}

                  {/* Graded Test Cases List */}
                  <div className="space-y-3">
                    {(submissionResult?.testCases || []).map((tr: any, idx: number) => (
                      <div
                        key={tr.testId || idx}
                        className={`p-3.5 rounded-xl border font-mono text-xs space-y-2 ${
                          tr.passed
                            ? 'bg-cyber-emerald/10 border-cyber-emerald/40 text-cyber-emerald'
                            : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center space-x-1.5">
                            {tr.passed ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            <span>
                              Test Case 0{idx + 1}: {tr.description}{' '}
                              {tr.hidden && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-space-800 text-slate-400 border border-space-700 ml-1">
                                  SERVER-SIDE HIDDEN
                                </span>
                              )}
                            </span>
                          </span>
                          <span>{tr.passed ? 'PASSED ✓' : 'FAILED ✗'}</span>
                        </div>

                        {!tr.passed && !tr.hidden && (
                          <div className="p-2 rounded bg-space-950/80 border border-space-800 text-[11px] space-y-1 text-slate-300">
                            {tr.input && tr.input.trim() !== '' && (
                              <div>Input: <span className="text-slate-400">{tr.input}</span></div>
                            )}
                            <div>Expected: <span className="text-emerald-400">{tr.expectedOutput}</span></div>
                            <div>Received: <span className="text-rose-400">{tr.actualOutput || '(none / error)'}</span></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {submissionResult?.completed ? (
                    <GlowButton
                      variant="primary"
                      size="lg"
                      className="w-full justify-center mt-2"
                      onClick={() => setCurrentStage(7)}
                      icon={<Award className="w-4 h-4 text-space-950" />}
                    >
                      VIEW FLIGHT CLEARANCE (RESULT) →
                    </GlowButton>
                  ) : (
                    <div className="flex items-center justify-between pt-2">
                      <GlowButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentStage(4)}
                        icon={<RotateCcw className="w-3.5 h-3.5" />}
                      >
                        REVISE CODE
                      </GlowButton>
                      <button
                        onClick={handleSubmitCode}
                        disabled={isExecuting}
                        className="px-4 py-2 rounded-xl bg-cyber-cyan text-space-950 font-mono text-xs font-bold shadow-glow-cyan hover:bg-cyan-300 transition-all flex items-center space-x-1.5"
                      >
                        <Rocket className="w-3.5 h-3.5" />
                        <span>RE-SUBMIT MISSION</span>
                      </button>
                    </div>
                  )}
                </GlassCard>
              )}
            </div>

            {/* Right Column: Monaco Code Editor & Live Console Output */}
            <div className="lg:col-span-7 space-y-4">
              {/* Genuine Java Monaco Editor */}
              <div className="h-[460px]">
                <JavaCodeEditor
                  value={code}
                  onChange={setCode}
                  starterCode={mission.codingChallenge?.starterCode}
                  onRun={handleRunCode}
                  onSubmit={handleSubmitCode}
                  isExecuting={isExecuting}
                  errorLine={submissionResult?.errorLine}
                  errorMessage={submissionResult?.stderr || submissionResult?.diagnosticHint}
                />
              </div>

              {/* Console & Sandbox Telemetry Terminal */}
              <div className="p-4 rounded-2xl bg-space-950 border border-space-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 border-b border-space-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span className="text-white font-bold uppercase">SANDBOX TERMINAL OUTPUT (JDK 21)</span>
                  </div>
                  {submissionResult?.executionTimeMs !== undefined && (
                    <span className="text-cyber-cyan text-[11px]">
                      {submissionResult.executionTimeMs} ms
                    </span>
                  )}
                </div>

                <div className="min-h-[90px] max-h-[160px] p-3 rounded-xl bg-space-900/90 text-slate-200 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {isExecuting ? (
                    <div className="text-cyber-cyan animate-pulse flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
                      <span>Transmitting Java payload to JDK 21 sandbox runner...</span>
                    </div>
                  ) : submissionResult ? (
                    submissionResult.success || submissionResult.completed ? (
                      <div className="text-emerald-400">
                        {submissionResult.stdout || '> Execution finished with 0 errors.'}
                      </div>
                    ) : (
                      <div className="text-rose-400 space-y-1">
                        <div>{submissionResult.stderr || '> Compilation or runtime discrepancy.'}</div>
                        {submissionResult.stdout && (
                          <div className="text-slate-400 pt-1 border-t border-space-800">
                            <div>Console Output:</div>
                            <div className="text-slate-300">{submissionResult.stdout}</div>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="text-slate-500">
                      &gt; Console idle. Click &quot;Run Code&quot; (^↵) to test, or &quot;Submit Mission&quot; (⇧^↵) to grade.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* STAGE 7 — RESULT (Cinematic Celebration & Level Up) */}
      {/* ---------------------------------------------------------------- */}
      {currentStage === 7 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 text-center"
        >
          <div className="relative rounded-3xl overflow-hidden glass-panel border border-cyber-emerald/50 shadow-[0_0_60px_rgba(16,185,129,0.3)] p-8 sm:p-14 space-y-8">
            {/* Background Hangar Image */}
            <div className="absolute inset-0 z-0 opacity-20">
              <img
                src={fleetHangarImg}
                alt="Fleet Hangar"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-space-950/80" />
            </div>

            {/* Glowing Starship Launch Animation */}
            <div className="relative z-10 space-y-4">
              <motion.div
                animate={{ y: [0, -18, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 mx-auto rounded-3xl bg-cyber-emerald/20 border-2 border-cyber-emerald flex items-center justify-center text-cyber-emerald shadow-[0_0_40px_rgba(16,185,129,0.5)]"
              >
                <Rocket className="w-12 h-12" />
              </motion.div>

              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-emerald/20 border border-cyber-emerald/40 text-cyber-emerald text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SPACECRAFT THRUSTERS ENGAGED // TRAJECTORY NOMINAL</span>
              </div>

              <h2 className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight uppercase">
                MISSION COMPLETE
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-mono">
                {mission.title} verified. Subsystem online and energy conduits humming within nominal parameters.
              </p>
            </div>

            {/* Dynamic Starship Visual Progression in Launch State */}
            <div className="relative z-10 max-w-3xl mx-auto">
              <StarshipVesselView
                gameState={gameState}
                flightStateOverride="launch"
                showControls={false}
              />
            </div>

            {/* Dynamic Star Rating and XP Rewards from Server Evaluation */}
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 py-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((starIndex) => {
                  const earned = starIndex <= (submissionResult?.starsEarned ?? 3);
                  return (
                    <Star
                      key={starIndex}
                      className={`w-8 h-8 transition-colors ${
                        earned
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                          : 'fill-transparent text-slate-600'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="h-8 w-px bg-space-800 hidden sm:block" />

              <div className="p-3 px-5 rounded-2xl bg-space-900/90 border border-cyber-cyan/40 font-mono text-sm text-cyber-cyan font-bold shadow-glow-cyan/20 flex items-center space-x-2">
                <Zap className="w-4 h-4 fill-current text-amber-400" />
                <span>
                  +{submissionResult?.xpEarned !== undefined ? submissionResult.xpEarned : (mission.xpReward || 100)} XP AWARDED
                </span>
              </div>

              <div className="p-3 px-5 rounded-2xl bg-space-900/90 border border-cyber-emerald/40 font-mono text-sm text-cyber-emerald font-bold shadow-glow-emerald/20 flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>MISSION 0{mission.missionOrder + 1} UNLOCKED</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-space-800">
              <GlowButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/map')}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                RETURN TO GALAXY MAP
              </GlowButton>

              <GlowButton
                variant="primary"
                size="lg"
                onClick={() => {
                  if (mission.missionOrder < 5) {
                    navigate(`/mission/${mission.id + 1}`);
                  } else {
                    navigate('/dashboard');
                  }
                }}
                icon={<Rocket className="w-4 h-4 text-space-950" />}
              >
                {mission.missionOrder < 5 ? `CONTINUE TO MISSION 0${mission.missionOrder + 1}` : 'RETURN TO COMMAND CENTER'}
              </GlowButton>
            </div>
          </div>
        </motion.div>
      )}

      {/* Celebration Modal Triggered on Successful Flight Clearance */}
      <GameCelebrationModal
        isOpen={showCelebrationModal}
        type={mission.missionOrder === 5 ? 'world_completed' : 'mission_completed'}
        title={mission.missionOrder === 5 ? 'IGNIS STATION COMPLETE' : `MISSION 0${mission.missionOrder} CLEARED!`}
        subtitle={
          mission.missionOrder === 5
            ? 'All Ignis Station missions cleared! 10 Stars achieved across all sector directives. Starship thrusters fully operational.'
            : `${mission.title} verified. Station fusion telemetry and memory allocations are operating within nominal parameters.`
        }
        badgeName={mission.missionOrder === 5 ? 'FIRST LAUNCH' : undefined}
        shipSystemUnlocked={mission.shipSystem ? mission.shipSystem.replace(/_/g, ' ') : undefined}
        missionNumber={mission.missionOrder}
        worldName={mission.worldName || 'Ignis Station'}
        xpGained={mission.xpReward || 100}
        starsGained={submissionResult?.starsEarned || 3}
        nextMissionUnlocked={mission.missionOrder < 5 ? mission.missionOrder + 1 : undefined}
        onNextAction={() => {
          setShowCelebrationModal(false);
          if (mission.missionOrder < 5) {
            navigate(`/mission/${mission.id + 1}`);
          } else {
            setCurrentStage(7);
          }
        }}
        onSecondaryAction={() => {
          setShowCelebrationModal(false);
          setCurrentStage(7);
        }}
        nextButtonText={mission.missionOrder < 5 ? `PROCEED TO MISSION 0${mission.missionOrder + 1} →` : 'REVIEW EXPEDITION TELEMETRY'}
        secondaryButtonText="VIEW FLIGHT CLEARANCE (STAGE 7)"
      />

      {/* Cinematic 1: Mission Intro / Briefing Overlay */}
      {mission && (
        <MissionIntroCinematic
          isOpen={showIntroBriefing && currentStage === 1}
          missionNumber={mission.missionOrder}
          missionTitle={mission.title}
          worldName={mission.worldName || 'Ignis Station'}
          locationName="Sector 01 // Orbital Rig"
          objective={mission.objective}
          javaConcept={mission.javaConcept}
          xpReward={mission.xpReward || 100}
          starsReward={3}
          locationImage={ignisImg}
          isBossMission={mission.isBossMission || mission.missionOrder === 5}
          onStartMission={() => setShowIntroBriefing(false)}
          onSkip={() => setShowIntroBriefing(false)}
        />
      )}

      {/* Cinematic 2: Code Running & Test Suite Analysis Sequence */}
      <CodeRunningCinematic
        isExecuting={isExecuting}
        totalTests={mission?.codingChallenge?.visibleTestCases?.length || 3}
        onFastForward={() => {
          setIsExecuting(false);
          setCurrentStage(6);
        }}
      />

      {/* Cinematic 3: Boss Defeated & Reactor Stabilization (Mission 5 / Boss Mission) */}
      <BossDefeatedCinematic
        isOpen={showBossVictory}
        bossTitle={mission.title}
        worldName={mission.worldName || 'Ignis Station'}
        xpAwarded={submissionResult?.xpEarned || mission.xpReward || 300}
        starsEarned={submissionResult?.starsEarned || 3}
        achievementTitle="WORLD CONQUEROR"
        onProceed={() => {
          setShowBossVictory(false);
          setShowPlanetUnlock(true);
        }}
      />

      {/* Cinematic 4: Planet Unlock Hyperspace Jump to Sector 2 Kryon Belt */}
      <PlanetUnlockCinematic
        isOpen={showPlanetUnlock}
        unlockedWorldName="Kryon Belt"
        unlockedWorldNumber={2}
        unlockedWorldTagline="Glacial Sub-Zero Asteroid Barrier"
        onProceed={() => {
          setShowPlanetUnlock(false);
          setShowCelebrationModal(true);
        }}
        onSkip={() => {
          setShowPlanetUnlock(false);
          setShowCelebrationModal(true);
        }}
      />
    </div>
  );
};
