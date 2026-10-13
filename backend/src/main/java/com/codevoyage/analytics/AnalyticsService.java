package com.codevoyage.analytics;

import com.codevoyage.analytics.dto.ConceptMasteryDTO;
import com.codevoyage.analytics.dto.UserAnalyticsDTO;
import com.codevoyage.challenge.CodingChallenge;
import com.codevoyage.challenge.TestCase;
import com.codevoyage.mission.Mission;
import com.codevoyage.mission.MissionRepository;
import com.codevoyage.progress.UserProgress;
import com.codevoyage.progress.UserProgressRepository;
import com.codevoyage.submission.Submission;
import com.codevoyage.submission.SubmissionRepository;
import com.codevoyage.user.User;
import com.codevoyage.user.UserLevelSystem;
import com.codevoyage.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final UserProgressRepository userProgressRepository;
    private final SubmissionRepository submissionRepository;
    private final MissionRepository missionRepository;

    public AnalyticsService(
            UserRepository userRepository,
            UserProgressRepository userProgressRepository,
            SubmissionRepository submissionRepository,
            MissionRepository missionRepository
    ) {
        this.userRepository = userRepository;
        this.userProgressRepository = userProgressRepository;
        this.submissionRepository = submissionRepository;
        this.missionRepository = missionRepository;
    }

    @Transactional(readOnly = true)
    public UserAnalyticsDTO getUserAnalytics(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Cadet not found: " + username));

        List<UserProgress> userProgressList = userProgressRepository.findByUserId(user.getId());
        List<Submission> submissions = submissionRepository.findByUserIdOrderBySubmittedAtDesc(user.getId());
        List<Mission> allMissions = missionRepository.findAll();

        Map<Long, UserProgress> progressByMissionId = userProgressList.stream()
                .collect(Collectors.toMap(up -> up.getMission().getId(), up -> up, (a, b) -> a));

        UserAnalyticsDTO analytics = new UserAnalyticsDTO();
        analytics.setUserId(user.getId());
        analytics.setUsername(user.getUsername());
        int actualXp = user.getXp() != null ? user.getXp() : 0;
        analytics.setCurrentXp(actualXp);
        analytics.setRankTitle(UserLevelSystem.getRankTitle(UserLevelSystem.calculateLevel(actualXp)));

        // 1. Lessons completed count
        int lessonsCompleted = (int) userProgressList.stream()
                .filter(up -> Boolean.TRUE.equals(up.getLessonCompleted()))
                .count();
        analytics.setLessonsCompleted(lessonsCompleted);

        // 2. Practice questions attempted and practice accuracy
        int practiceCompletedCount = (int) userProgressList.stream()
                .filter(up -> Boolean.TRUE.equals(up.getPracticeCompleted()))
                .count();
        // Each mission in World 1 contains 4 practice questions
        int practiceQuestionsAttempted = practiceCompletedCount * 4;
        analytics.setPracticeQuestionsAttempted(practiceQuestionsAttempted);

        // Practice accuracy: Derived from actual practice completions vs retry attempts
        int practiceAccuracy = 0;
        if (practiceCompletedCount > 0) {
            // Base practice completion demonstrates understanding. We calculate weighted accuracy:
            // 100% minus minor deductions if attempts on that mission were unusually high before completing.
            double totalAccuracySum = 0;
            for (UserProgress up : userProgressList) {
                if (Boolean.TRUE.equals(up.getPracticeCompleted())) {
                    int attempts = up.getAttempts() != null ? up.getAttempts() : 1;
                    double missionPracticeAcc = Math.max(70.0, 100.0 - (attempts > 3 ? (attempts - 3) * 5.0 : 0));
                    totalAccuracySum += missionPracticeAcc;
                }
            }
            practiceAccuracy = (int) Math.round(totalAccuracySum / practiceCompletedCount);
        }
        analytics.setPracticeAccuracyPercentage(practiceAccuracy);

        // 3. Coding challenges completed & attempts
        int challengesCompleted = (int) userProgressList.stream()
                .filter(up -> Boolean.TRUE.equals(up.getCompleted()))
                .count();
        analytics.setCodingChallengesCompleted(challengesCompleted);

        int totalCodingAttempts = submissions.size();
        if (totalCodingAttempts == 0) {
            // Fallback to progress attempts counter if submissions were purged or imported
            totalCodingAttempts = userProgressList.stream()
                    .mapToInt(up -> up.getAttempts() != null ? up.getAttempts() : 0)
                    .sum();
        }
        analytics.setCodingAttempts(totalCodingAttempts);

        // 4. Test success rate & submission classifications
        int successfulSubmissions = 0;
        int syntaxErrors = 0;
        int runtimeErrors = 0;
        int wrongAnswers = 0;
        for (Submission sub : submissions) {
            String status = sub.getStatus();
            if ("SUCCESS".equalsIgnoreCase(status)) {
                successfulSubmissions++;
            } else if ("COMPILE_ERROR".equalsIgnoreCase(status)) {
                syntaxErrors++;
            } else if ("RUNTIME_ERROR".equalsIgnoreCase(status) || "TIMEOUT".equalsIgnoreCase(status)) {
                runtimeErrors++;
            } else if ("WRONG_ANSWER".equalsIgnoreCase(status)) {
                wrongAnswers++;
            }
        }
        analytics.setSyntaxErrorsEncountered(syntaxErrors);
        analytics.setRuntimeErrorsEncountered(runtimeErrors);
        analytics.setLogicFailuresEncountered(wrongAnswers);

        double testSuccessRate = totalCodingAttempts > 0
                ? Math.round((successfulSubmissions * 100.0 / totalCodingAttempts) * 10.0) / 10.0
                : 0.0;
        // If they completed challenges, ensure test success rate reflects actual completion evidence
        if (challengesCompleted > 0 && testSuccessRate == 0.0) {
            testSuccessRate = Math.min(100.0, Math.round((challengesCompleted * 100.0 / Math.max(1, totalCodingAttempts)) * 10.0) / 10.0);
        }
        analytics.setTestSuccessRate(testSuccessRate);

        // Average attempts per challenge
        double avgAttempts = challengesCompleted > 0
                ? Math.round((totalCodingAttempts * 1.0 / challengesCompleted) * 10.0) / 10.0
                : (totalCodingAttempts > 0 ? totalCodingAttempts : 0);
        analytics.setAverageAttemptsPerChallenge(avgAttempts);

        // First attempt passes
        int firstAttemptPasses = (int) userProgressList.stream()
                .filter(up -> Boolean.TRUE.equals(up.getCompleted()) && (up.getAttempts() == null || up.getAttempts() <= 1))
                .count();
        analytics.setFirstAttemptPasses(firstAttemptPasses);

        // 5. Hints used
        int totalHintsUsed = userProgressList.stream()
                .mapToInt(up -> up.getHintsUsed() != null ? up.getHintsUsed() : 0)
                .sum();
        analytics.setHintsUsed(totalHintsUsed);

        // 6. Time spent
        long totalSeconds = userProgressList.stream()
                .mapToLong(up -> up.getCompletionTimeSeconds() != null ? up.getCompletionTimeSeconds() : 0L)
                .sum();
        analytics.setTotalTimeSpentSeconds(totalSeconds);
        analytics.setFormattedTimeSpent(formatTime(totalSeconds));

        // 7. World Progress
        int totalMissions = allMissions.size();
        analytics.setTotalMissionsCount(totalMissions);
        analytics.setCompletedMissionsCount(challengesCompleted);
        int worldProgress = totalMissions > 0 ? (int) Math.round((challengesCompleted * 100.0) / totalMissions) : 0;
        analytics.setWorldProgressPercentage(worldProgress);

        // 8. Evidence-Based Concept Mastery Calculation
        // Track the 10 core Java concepts:
        // 1. Java Basics
        // 2. Variables
        // 3. Data Types
        // 4. Input
        // 5. Operators
        // 6. Conditions
        // 7. Loops
        // 8. Methods
        // 9. Arrays
        // 10. OOP
        List<ConceptMasteryDTO> conceptList = buildEvidenceBasedMasteries(progressByMissionId, submissions);
        analytics.setConceptMasteries(conceptList);

        // Segregate Strong Concepts vs Concepts Needing Practice
        List<String> strong = new ArrayList<>();
        List<String> needingPractice = new ArrayList<>();

        for (ConceptMasteryDTO cm : conceptList) {
            if (cm.getMasteryPercentage() >= 75) {
                strong.add(cm.getConceptName());
            } else if ("NEEDS_PRACTICE".equals(cm.getStatus()) || (cm.getMasteryPercentage() > 0 && cm.getMasteryPercentage() < 75)) {
                needingPractice.add(cm.getConceptName());
            }
        }
        // If user is just starting, indicate the earliest available concept as needing practice
        if (strong.isEmpty() && needingPractice.isEmpty() && !conceptList.isEmpty()) {
            needingPractice.add(conceptList.get(0).getConceptName());
        }
        analytics.setStrongConcepts(strong);
        analytics.setConceptsNeedingPractice(needingPractice);

        // 9. Common Errors Diagnostics
        analytics.setCommonErrors(detectCommonErrors(submissions, userProgressList));

        return analytics;
    }

    /**
     * Compute evidence-based mastery for the 10 requested Java concepts.
     * Evidence Formula:
     * - Lesson completion: 20 points
     * - Practice verification: 30 points (based on practice completion and zero/low retry deduction)
     * - Coding Challenge completion (all tests passed): 40 points
     * - Efficiency bonus (passed with <= 2 attempts and 0 hints): 10 points
     * Total = 100%
     */
    private List<ConceptMasteryDTO> buildEvidenceBasedMasteries(
            Map<Long, UserProgress> progressMap,
            List<Submission> submissions
    ) {
        List<ConceptMasteryDTO> list = new ArrayList<>();

        // 1. Java Basics (Mission 1)
        list.add(calculateConceptEvidence(
                "java-basics",
                "Java Basics",
                "Foundation",
                1L,
                progressMap,
                List.of(
                        "Class declaration & structure",
                        "public static void main entrypoint",
                        "System.out.println console stream",
                        "Semicolon syntax termination"
                ),
                List.of(
                        "Forgetting closing semicolon ';'",
                        "Capitalizing 'system.out.println' incorrectly"
                ),
                submissions
        ));

        // 2. Variables (Mission 2)
        list.add(calculateConceptEvidence(
                "variables",
                "Variables",
                "Memory & State",
                2L,
                progressMap,
                List.of(
                        "Named memory slot allocation",
                        "LowerCamelCase variable naming",
                        "Variable initialization & assignment",
                        "In-place telemetry re-assignment"
                ),
                List.of(
                        "Attempting to re-declare existing variable with type again",
                        "Using uninitialized variable values"
                ),
                submissions
        ));

        // 3. Data Types (Mission 2 reinforcement)
        list.add(calculateConceptEvidence(
                "data-types",
                "Data Types",
                "Type System",
                2L,
                progressMap,
                List.of(
                        "Primitive type sizing (int, double, boolean, char)",
                        "Floating-point vs integer precision",
                        "String literal handling",
                        "Type compatibility & casting"
                ),
                List.of(
                        "Assigning floating point numbers to int without cast",
                        "String quotes vs char single quotes"
                ),
                submissions
        ));

        // 4. Input (Mission 3)
        list.add(calculateConceptEvidence(
                "input",
                "Input",
                "Telemetry IO",
                3L,
                progressMap,
                List.of(
                        "java.util.Scanner import & instantiation",
                        "System.in standard stream binding",
                        "nextLine() text token reading",
                        "nextInt() numerical stream parsing"
                ),
                List.of(
                        "Forgetting to import java.util.Scanner",
                        "Input buffer newline traps after nextInt()"
                ),
                submissions
        ));

        // 5. Operators (Mission 4)
        list.add(calculateConceptEvidence(
                "operators",
                "Operators",
                "Computation",
                4L,
                progressMap,
                List.of(
                        "Arithmetic operators (+, -, *, /, %)",
                        "Integer truncation division pitfalls",
                        "Compound assignments (+=, -=, *=)",
                        "Operator precedence & parenthesis grouping"
                ),
                List.of(
                        "Integer division truncation (e.g. 5 / 2 = 2 instead of 2.5)",
                        "Modulo operator remainder miscalculations"
                ),
                submissions
        ));

        // 6. Conditions (Mission 5 - Boss Mission)
        list.add(calculateConceptEvidence(
                "conditions",
                "Conditions",
                "Control Flow",
                5L,
                progressMap,
                List.of(
                        "Boolean expressions & relational operators (==, !=, <, >)",
                        "Logical AND (&&), OR (||), and NOT (!)",
                        "Multi-branch if-else-if gating",
                        "Reactor emergency threshold interlocks"
                ),
                List.of(
                        "Using single '=' assignment instead of '==' comparison",
                        "Overlapping branch conditions that starve else blocks"
                ),
                submissions
        ));

        // Concepts 7-10: Advanced curriculum (Future worlds / unlocked conditionally)
        // 7. Loops
        list.add(createFutureConcept(
                "loops",
                "Loops",
                "Control Flow",
                progressMap.containsKey(5L) && Boolean.TRUE.equals(progressMap.get(5L).getCompleted()),
                "Sector 03: Cyclic telemetry loops (for, while, do-while) and break/continue control."
        ));

        // 8. Methods
        list.add(createFutureConcept(
                "methods",
                "Methods",
                "Architecture",
                false,
                "Sector 04: Modular subroutines, parameter passing, return signatures, and DRY design."
        ));

        // 9. Arrays
        list.add(createFutureConcept(
                "arrays",
                "Arrays",
                "Data Structures",
                false,
                "Sector 05: Fixed-length indexable collections, multidimensional grids, and traversal."
        ));

        // 10. OOP
        list.add(createFutureConcept(
                "oop",
                "OOP",
                "Object Oriented",
                false,
                "Sector 06: Object-Oriented Programming (encapsulation, constructors, inheritance, polymorphism)."
        ));

        return list;
    }

    private ConceptMasteryDTO calculateConceptEvidence(
            String key,
            String name,
            String category,
            Long missionId,
            Map<Long, UserProgress> progressMap,
            List<String> evidencePoints,
            List<String> commonErrors,
            List<Submission> submissions
    ) {
        UserProgress up = progressMap.get(missionId);

        boolean lessonDone = up != null && Boolean.TRUE.equals(up.getLessonCompleted());
        boolean practiceDone = up != null && Boolean.TRUE.equals(up.getPracticeCompleted());
        boolean challengeDone = up != null && Boolean.TRUE.equals(up.getCompleted());
        int attempts = up != null && up.getAttempts() != null ? up.getAttempts() : 0;
        int hintsUsed = up != null && up.getHintsUsed() != null ? up.getHintsUsed() : 0;

        int score = 0;
        if (lessonDone) score += 20;
        if (practiceDone) {
            // 30 points for practice verification
            score += 30;
        }
        if (challengeDone) {
            // 40 points for passing test suites
            score += 40;
            // Efficiency bonus: up to 10 points
            if (attempts <= 2 && hintsUsed == 0) {
                score += 10;
            } else if (attempts <= 3 && hintsUsed <= 1) {
                score += 5;
            }
        } else if (attempts > 0) {
            // Partial attempt credit (up to 15 points)
            score += Math.min(15, attempts * 5);
        }

        // Clamp 0 - 100
        score = Math.min(100, Math.max(0, score));

        String status;
        if (score >= 85) {
            status = "MASTERED";
        } else if (score >= 60) {
            status = "PROFICIENT";
        } else if (attempts > 0 || lessonDone || practiceDone) {
            status = "NEEDS_PRACTICE";
        } else {
            status = (missionId == 1L || (progressMap.containsKey(missionId - 1) && Boolean.TRUE.equals(progressMap.get(missionId - 1).getCompleted())))
                    ? "AVAILABLE"
                    : "LOCKED";
        }

        int practiceAcc = practiceDone ? Math.max(80, 100 - (attempts > 3 ? (attempts - 3) * 5 : 0)) : (lessonDone ? 40 : 0);
        int testsPassed = challengeDone ? 4 : (attempts > 0 ? 1 : 0);
        int totalTests = 4;

        return new ConceptMasteryDTO(
                key,
                name,
                category,
                score,
                status,
                lessonDone,
                practiceDone,
                challengeDone,
                practiceAcc,
                attempts,
                testsPassed,
                totalTests,
                hintsUsed,
                evidencePoints,
                commonErrors
        );
    }

    private ConceptMasteryDTO createFutureConcept(
            String key,
            String name,
            String category,
            boolean isAvailable,
            String summary
    ) {
        return new ConceptMasteryDTO(
                key,
                name,
                category,
                0,
                isAvailable ? "AVAILABLE" : "LOCKED",
                false,
                false,
                false,
                0,
                0,
                0,
                0,
                0,
                List.of(summary),
                List.of()
        );
    }

    private List<String> detectCommonErrors(List<Submission> submissions, List<UserProgress> userProgressList) {
        List<String> errors = new ArrayList<>();
        boolean hasCompileError = false;
        boolean hasWrongAnswer = false;
        boolean hasHighHints = false;

        for (Submission s : submissions) {
            if ("COMPILE_ERROR".equalsIgnoreCase(s.getStatus())) {
                hasCompileError = true;
            } else if ("WRONG_ANSWER".equalsIgnoreCase(s.getStatus())) {
                hasWrongAnswer = true;
            }
        }

        int totalHints = userProgressList.stream()
                .mapToInt(up -> up.getHintsUsed() != null ? up.getHintsUsed() : 0)
                .sum();
        if (totalHints >= 3) {
            hasHighHints = true;
        }

        if (hasCompileError) {
            errors.add("Syntax Slip: Missing semicolon (;) or mismatched brackets in Java class body");
            errors.add("Type Mismatch: Attempting to store incompatible data without casting");
        } else {
            errors.add("Watch out: Java is case-sensitive (e.g. System vs system)");
        }

        if (hasWrongAnswer) {
            errors.add("Logic Deviation: Output string format does not match expected terminal spec exactly");
            errors.add("Integer Division Truncation: Using '/' on two integers drops decimal remainder");
        } else {
            errors.add("Scanner Stream: Remember to consume newline when transitioning from nextInt() to nextLine()");
        }

        if (hasHighHints) {
            errors.add("Hint Dependency: Over-relying on hints before attempting independent problem breakdown");
        }

        return errors;
    }

    private String formatTime(long seconds) {
        if (seconds <= 0) return "0m";
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long remainingSecs = seconds % 60;

        if (hours > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else if (minutes > 0) {
            return String.format("%dm %ds", minutes, remainingSecs);
        } else {
            return String.format("%ds", remainingSecs);
        }
    }
}
