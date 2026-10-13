import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Clock,
  HelpCircle,
  TrendingUp,
  Flame,
  ArrowRight,
  ShieldAlert,
  BrainCircuit,
  Terminal,
  Target,
  BarChart3,
  Layers,
  Sparkles,
  Zap,
  RefreshCw,
  GitFork
} from 'lucide-react';
import { analyticsService, UserAnalytics, ConceptMastery } from '../services/analyticsService';
import { GlassCard } from '../components/GlassCard';
import { GlowButton } from '../components/GlowButton';
import { ProgressBar } from '../components/ProgressBar';

export const StudentAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<ConceptMastery | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getMyAnalytics();
      setAnalytics(data);
      if (data.conceptMasteries && data.conceptMasteries.length > 0) {
        setSelectedConcept(data.conceptMasteries[0]);
      }
    } catch (err) {
      console.error('Failed to load learning analytics telemetry', err);
      setError('Telemetry link severed: Unable to load authenticated cadet learning evidence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !analytics) {
    return (
      <div className="p-8 rounded-3xl glass-panel border border-cyber-cyan/30 flex flex-col items-center justify-center space-y-4 min-h-[320px]">
        <div className="w-10 h-10 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-cyber-cyan tracking-widest uppercase animate-pulse">
          COMPILING EVIDENCE-BASED LEARNING TELEMETRY...
        </span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6 rounded-3xl glass-panel border border-red-500/30 text-center space-y-4 font-mono">
        <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
        <p className="text-xs text-red-300">{error || 'No learning evidence discovered.'}</p>
        <GlowButton variant="secondary" size="sm" onClick={fetchAnalytics}>
          RE-ESTABLISH TELEMETRY LINK
        </GlowButton>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Analytics Header with Privacy Gating Notice */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border border-cyber-cyan/30 bg-gradient-to-r from-space-950 via-space-900 to-space-950">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-cyber-cyan text-xs font-bold uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4 text-cyber-cyan animate-pulse" />
            <span>LEARNING EVIDENCE & MASTERY TELEMETRY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            CADET LEARNING ANALYTICS
          </h2>
          <p className="text-xs text-slate-400">
            Measures genuine Java competency through practice accuracy, compiler test pass rates, and challenge attempts—never inferred from XP alone.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-space-900 border border-cyber-cyan/20 text-[10px] text-cyber-cyan flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyber-emerald animate-ping" />
            <span className="font-bold">PRIVATE & ENCRYPTED SESSION</span>
          </div>
          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl bg-space-900 hover:bg-space-800 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Refresh Learning Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Direct Metrics Grid: 6 Primary Vitals */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Lessons Completed */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-space-900/60 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
            <span>Lessons</span>
            <BookOpen className="w-3.5 h-3.5 text-cyber-cyan" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics.lessonsCompleted}{' '}
            <span className="text-[10px] font-normal text-slate-400">/ {analytics.totalMissionsCount}</span>
          </div>
          <p className="text-[9px] text-slate-400">Theory checkpoints read</p>
        </div>

        {/* Metric 2: Practice Questions Attempted */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-space-900/60 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
            <span>Practice Drills</span>
            <Target className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {analytics.practiceQuestionsAttempted}
          </div>
          <p className="text-[9px] text-slate-400">Interactive questions answered</p>
        </div>

        {/* Metric 3: Practice Accuracy */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-space-900/60 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
            <span>Accuracy</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyber-emerald" />
          </div>
          <div className="text-2xl font-black text-cyber-emerald">
            {analytics.practiceAccuracyPercentage}%
          </div>
          <p className="text-[9px] text-slate-400">First-attempt answer precision</p>
        </div>

        {/* Metric 4: Coding Challenges Completed */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-space-900/60 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
            <span>Challenges</span>
            <Code2 className="w-3.5 h-3.5 text-cyber-purple" />
          </div>
          <div className="text-2xl font-black text-cyber-purple">
            {analytics.codingChallengesCompleted}{' '}
            <span className="text-[10px] font-normal text-slate-400">/ {analytics.totalMissionsCount}</span>
          </div>
          <p className="text-[9px] text-slate-400">Compiled programs passed</p>
        </div>

        {/* Metric 5: Test Success Rate */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-space-900/60 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
            <span>Test Success</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">
            {analytics.testSuccessRate}%
          </div>
          <p className="text-[9px] text-slate-400">Across all runs & hidden tests</p>
        </div>

        {/* Metric 6: Time Spent & Hints */}
        <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-space-900/60 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
            <span>Time / Hints</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-black text-white truncate">
            {analytics.formattedTimeSpent}
          </div>
          <p className="text-[9px] text-slate-400">
            Hints used: <span className={analytics.hintsUsed === 0 ? 'text-cyber-emerald font-bold' : 'text-amber-400'}>{analytics.hintsUsed}</span>
          </p>
        </div>
      </div>

      {/* Focus Callouts: Strong Concepts vs Concepts Needing Practice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strong Concepts */}
        <div className="p-5 rounded-2xl glass-panel border border-cyber-emerald/40 bg-space-900/50 space-y-3">
          <div className="flex items-center justify-between border-b border-space-800 pb-2">
            <span className="text-xs font-bold text-cyber-emerald uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyber-emerald" />
              <span>STRONG CONCEPTS (EVIDENCE ≥ 75%)</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {analytics.strongConcepts.length} Validated
            </span>
          </div>

          {analytics.strongConcepts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analytics.strongConcepts.map((sc) => (
                <div
                  key={sc}
                  className="px-3 py-1.5 rounded-xl bg-cyber-emerald/15 border border-cyber-emerald/40 text-cyber-emerald text-xs font-bold flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{sc}</span>
                  <span className="text-[10px] opacity-75 font-mono">✓ High Accuracy</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Complete coding challenges with verified test runs to graduate concepts to the Strong category.
            </p>
          )}
        </div>

        {/* Concepts Needing Practice */}
        <div className="p-5 rounded-2xl glass-panel border border-amber-500/40 bg-space-900/50 space-y-3">
          <div className="flex items-center justify-between border-b border-space-800 pb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>CONCEPTS NEEDING PRACTICE (&lt; 75%)</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {analytics.conceptsNeedingPractice.length} Requiring Drill
            </span>
          </div>

          {analytics.conceptsNeedingPractice.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analytics.conceptsNeedingPractice.map((cn) => (
                <div
                  key={cn}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center space-x-1.5"
                >
                  <Target className="w-3 h-3 text-amber-400" />
                  <span>{cn}</span>
                  <span className="text-[10px] opacity-75 font-mono">Drill Recommended</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-cyber-emerald italic font-bold">
              Outstanding work, Cadet! All attempted concepts demonstrate ≥75% evidence-based mastery.
            </p>
          )}
        </div>
      </div>

      {/* Challenge Performance Breakdown & Common Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Challenge Performance Telemetry */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 bg-space-900/60 space-y-4">
          <div className="flex items-center justify-between border-b border-space-800 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-cyber-purple" />
              <span>CHALLENGE PERFORMANCE</span>
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Coding Attempts:</span>
              <span className="font-bold text-white">{analytics.codingAttempts}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Avg. Attempts / Challenge:</span>
              <span className="font-bold text-cyber-cyan">{analytics.averageAttemptsPerChallenge}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">First-Attempt Clears:</span>
              <span className="font-bold text-cyber-emerald">{analytics.firstAttemptPasses}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Syntax Compile Errors:</span>
              <span className="font-bold text-amber-400">{analytics.syntaxErrorsEncountered}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Logic & Runtime Deviations:</span>
              <span className="font-bold text-red-400">{analytics.logicFailuresEncountered + analytics.runtimeErrorsEncountered}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-space-800">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">World 1 Progress</span>
              <span className="text-cyber-cyan font-bold">{analytics.worldProgressPercentage}%</span>
            </div>
            <ProgressBar value={analytics.worldProgressPercentage} max={100} color="cyan" size="sm" />
          </div>
        </div>

        {/* Common Errors & Tactical Advice */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-white/10 bg-space-900/60 space-y-4">
          <div className="flex items-center justify-between border-b border-space-800 pb-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>COMMON COMPILER & LOGIC ERRORS ENCOUNTERED</span>
            </span>
            <span className="text-[10px] text-slate-400">Byte Diagnostic Review</span>
          </div>

          <div className="space-y-2">
            {analytics.commonErrors && analytics.commonErrors.length > 0 ? (
              analytics.commonErrors.map((err, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-space-950/80 border border-space-800 text-xs flex items-start space-x-2.5"
                >
                  <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-slate-200 font-medium">{err}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-space-950 text-xs text-slate-400 text-center">
                Clean diagnostic log. No frequent runtime faults detected.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 10 Java Concepts Mastery Table & Interactive Inspector */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-space-800 pb-3">
          <div>
            <div className="flex items-center space-x-2 text-cyber-cyan text-xs font-bold uppercase">
              <Layers className="w-4 h-4" />
              <span>10-CORE JAVA CURRICULUM MASTERY MATRIX</span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
              CONCEPT EVIDENCE EVALUATION
            </h3>
            <p className="text-xs text-slate-400">
              Mastery calculated from: Lesson (20%), Practice Verification (30%), Challenge Pass (40%), and Zero-Hint Efficiency (10%).
            </p>
          </div>

          <Link
            to="/skills"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyber-purple/20 border border-cyber-purple/40 text-xs text-cyber-purple hover:bg-cyber-purple/30 font-bold transition-colors"
          >
            <GitFork className="w-3.5 h-3.5 rotate-180" />
            <span>FULL SKILL TREE</span>
          </Link>
        </div>

        {/* Interactive Matrix of 10 Concepts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analytics.conceptMasteries.map((concept) => {
            const isSelected = selectedConcept?.conceptKey === concept.conceptKey;
            const isMastered = concept.status === 'MASTERED';
            const isProficient = concept.status === 'PROFICIENT';
            const needsPractice = concept.status === 'NEEDS_PRACTICE';
            const isLocked = concept.status === 'LOCKED';

            return (
              <div
                key={concept.conceptKey}
                onClick={() => setSelectedConcept(concept)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-cyber-cyan bg-space-900/90 shadow-glow-cyan'
                    : isMastered
                    ? 'border-cyber-emerald/40 bg-space-900/60 hover:border-cyber-emerald'
                    : isProficient
                    ? 'border-cyan-500/40 bg-space-900/60 hover:border-cyan-400'
                    : needsPractice
                    ? 'border-amber-500/40 bg-space-900/60 hover:border-amber-400'
                    : 'border-space-800/60 bg-space-950/40 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      {concept.category}
                    </span>
                    <h4 className="text-base font-black text-white">{concept.conceptName}</h4>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isMastered
                        ? 'bg-cyber-emerald/15 text-cyber-emerald border-cyber-emerald/40'
                        : isProficient
                        ? 'bg-cyan-500/15 text-cyan-400 border-cyan-400/40'
                        : needsPractice
                        ? 'bg-amber-500/15 text-amber-300 border-amber-400/40'
                        : isLocked
                        ? 'bg-space-900 text-slate-500 border-space-800'
                        : 'bg-space-800 text-slate-300 border-space-700'
                    }`}
                  >
                    {concept.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Evidence Checklist Mini Badges */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <div
                    className={`px-2 py-1 rounded-lg border text-center font-bold ${
                      concept.lessonCompleted
                        ? 'bg-cyber-emerald/10 border-cyber-emerald/30 text-cyber-emerald'
                        : 'bg-space-950 border-space-800 text-slate-600'
                    }`}
                  >
                    Lesson {concept.lessonCompleted ? '✓' : '○'}
                  </div>
                  <div
                    className={`px-2 py-1 rounded-lg border text-center font-bold ${
                      concept.practiceCompleted
                        ? 'bg-cyber-emerald/10 border-cyber-emerald/30 text-cyber-emerald'
                        : 'bg-space-950 border-space-800 text-slate-600'
                    }`}
                  >
                    Drill {concept.practiceCompleted ? '✓' : '○'}
                  </div>
                  <div
                    className={`px-2 py-1 rounded-lg border text-center font-bold ${
                      concept.challengeCompleted
                        ? 'bg-cyber-emerald/10 border-cyber-emerald/30 text-cyber-emerald'
                        : 'bg-space-950 border-space-800 text-slate-600'
                    }`}
                  >
                    Code {concept.challengeCompleted ? '✓' : '○'}
                  </div>
                </div>

                {/* Progress Bar & Numerical Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Verifiable Learning Mastery</span>
                    <span
                      className={`font-black ${
                        isMastered
                          ? 'text-cyber-emerald'
                          : isProficient
                          ? 'text-cyan-400'
                          : needsPractice
                          ? 'text-amber-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {concept.masteryPercentage}%
                    </span>
                  </div>
                  <ProgressBar
                    value={concept.masteryPercentage}
                    max={100}
                    color={isMastered ? 'emerald' : needsPractice ? 'amber' : 'cyan'}
                    size="sm"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Concept Deep-Dive Inspection Card */}
        {selectedConcept && (
          <div className="p-5 rounded-2xl bg-space-950/80 border border-cyber-cyan/30 space-y-4">
            <div className="flex items-center justify-between border-b border-space-800 pb-3">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-5 h-5 text-cyber-cyan" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  LEARNING EVIDENCE AUDIT: {selectedConcept.conceptName}
                </h4>
              </div>
              <span className="text-xs font-bold text-cyber-cyan">
                Mastery Score: {selectedConcept.masteryPercentage}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Evidence Points */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-cyber-emerald uppercase tracking-wider block">
                  Demonstrated Competencies:
                </span>
                <ul className="space-y-1.5">
                  {selectedConcept.evidencePoints.map((pt, i) => (
                    <li key={i} className="flex items-start space-x-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyber-emerald shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Pitfalls For This Concept */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Identified Pitfalls & Precautions:
                </span>
                {selectedConcept.commonErrors.length > 0 ? (
                  <ul className="space-y-1.5">
                    {selectedConcept.commonErrors.map((err, i) => (
                      <li key={i} className="flex items-start space-x-2 text-slate-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">Curriculum progression unlocked in upcoming sector.</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                to="/codex"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyber-cyan hover:underline"
              >
                <span>OPEN JAVA CODEX REFERENCE FOR {selectedConcept.conceptName.toUpperCase()} &rarr;</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
