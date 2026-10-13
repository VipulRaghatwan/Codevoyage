import { apiClient } from './apiClient';

export interface ConceptMastery {
  conceptKey: string;
  conceptName: string;
  category: string;
  masteryPercentage: number;
  status: 'MASTERED' | 'PROFICIENT' | 'NEEDS_PRACTICE' | 'AVAILABLE' | 'LOCKED';
  lessonCompleted: boolean;
  practiceCompleted: boolean;
  challengeCompleted: boolean;
  practiceAccuracy: number;
  codingAttempts: number;
  testsPassed: number;
  totalTests: number;
  hintsUsed: number;
  evidencePoints: string[];
  commonErrors: string[];
}

export interface UserAnalytics {
  userId: number;
  username: string;
  rankTitle: string;
  currentXp: number;
  lessonsCompleted: number;
  practiceQuestionsAttempted: number;
  practiceAccuracyPercentage: number;
  codingChallengesCompleted: number;
  codingAttempts: number;
  testSuccessRate: number;
  hintsUsed: number;
  totalTimeSpentSeconds: number;
  formattedTimeSpent: string;
  worldProgressPercentage: number;
  completedMissionsCount: number;
  totalMissionsCount: number;
  conceptMasteries: ConceptMastery[];
  strongConcepts: string[];
  conceptsNeedingPractice: string[];
  commonErrors: string[];
  firstAttemptPasses: number;
  syntaxErrorsEncountered: number;
  runtimeErrorsEncountered: number;
  logicFailuresEncountered: number;
  averageAttemptsPerChallenge: number;
}

export const analyticsService = {
  getMyAnalytics: async (): Promise<UserAnalytics> => {
    const res = await apiClient.get<UserAnalytics>('/analytics/me');
    return res.data;
  },
};
