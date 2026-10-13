package com.codevoyage.analytics.dto;

import java.util.List;

public class ConceptMasteryDTO {
    private String conceptKey;         // java-basics, variables, data-types, input, operators, conditions, loops, methods, arrays, oop
    private String conceptName;        // Java Basics, Variables, Data Types, Input, Operators, Conditions, Loops, Methods, Arrays, OOP
    private String category;           // Foundation, Control Flow, Data Structures, Architecture, etc.
    private int masteryPercentage;     // 0 - 100 based on verified evidence
    private String status;             // MASTERED (>=85%), PROFICIENT (>=60%), NEEDS_PRACTICE (<60% & attempted), LOCKED / UNLOCKED
    private boolean lessonCompleted;
    private boolean practiceCompleted;
    private boolean challengeCompleted;
    private int practiceAccuracy;      // 0 - 100
    private int codingAttempts;
    private int testsPassed;
    private int totalTests;
    private int hintsUsed;
    private List<String> evidencePoints;
    private List<String> commonErrors;

    public ConceptMasteryDTO() {}

    public ConceptMasteryDTO(
            String conceptKey,
            String conceptName,
            String category,
            int masteryPercentage,
            String status,
            boolean lessonCompleted,
            boolean practiceCompleted,
            boolean challengeCompleted,
            int practiceAccuracy,
            int codingAttempts,
            int testsPassed,
            int totalTests,
            int hintsUsed,
            List<String> evidencePoints,
            List<String> commonErrors
    ) {
        this.conceptKey = conceptKey;
        this.conceptName = conceptName;
        this.category = category;
        this.masteryPercentage = masteryPercentage;
        this.status = status;
        this.lessonCompleted = lessonCompleted;
        this.practiceCompleted = practiceCompleted;
        this.challengeCompleted = challengeCompleted;
        this.practiceAccuracy = practiceAccuracy;
        this.codingAttempts = codingAttempts;
        this.testsPassed = testsPassed;
        this.totalTests = totalTests;
        this.hintsUsed = hintsUsed;
        this.evidencePoints = evidencePoints;
        this.commonErrors = commonErrors;
    }

    public String getConceptKey() { return conceptKey; }
    public void setConceptKey(String conceptKey) { this.conceptKey = conceptKey; }

    public String getConceptName() { return conceptName; }
    public void setConceptName(String conceptName) { this.conceptName = conceptName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getMasteryPercentage() { return masteryPercentage; }
    public void setMasteryPercentage(int masteryPercentage) { this.masteryPercentage = masteryPercentage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isLessonCompleted() { return lessonCompleted; }
    public void setLessonCompleted(boolean lessonCompleted) { this.lessonCompleted = lessonCompleted; }

    public boolean isPracticeCompleted() { return practiceCompleted; }
    public void setPracticeCompleted(boolean practiceCompleted) { this.practiceCompleted = practiceCompleted; }

    public boolean isChallengeCompleted() { return challengeCompleted; }
    public void setChallengeCompleted(boolean challengeCompleted) { this.challengeCompleted = challengeCompleted; }

    public int getPracticeAccuracy() { return practiceAccuracy; }
    public void setPracticeAccuracy(int practiceAccuracy) { this.practiceAccuracy = practiceAccuracy; }

    public int getCodingAttempts() { return codingAttempts; }
    public void setCodingAttempts(int codingAttempts) { this.codingAttempts = codingAttempts; }

    public int getTestsPassed() { return testsPassed; }
    public void setTestsPassed(int testsPassed) { this.testsPassed = testsPassed; }

    public int getTotalTests() { return totalTests; }
    public void setTotalTests(int totalTests) { this.totalTests = totalTests; }

    public int getHintsUsed() { return hintsUsed; }
    public void setHintsUsed(int hintsUsed) { this.hintsUsed = hintsUsed; }

    public List<String> getEvidencePoints() { return evidencePoints; }
    public void setEvidencePoints(List<String> evidencePoints) { this.evidencePoints = evidencePoints; }

    public List<String> getCommonErrors() { return commonErrors; }
    public void setCommonErrors(List<String> commonErrors) { this.commonErrors = commonErrors; }
}
