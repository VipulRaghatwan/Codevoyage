package com.codevoyage.submission.dto;

import java.util.ArrayList;
import java.util.List;

public class SubmissionResultDTO {
    private String status; // SUCCESS, COMPILE_ERROR, RUNTIME_ERROR, TIMEOUT, WRONG_ANSWER
    private boolean success;
    private boolean completed;
    private String stdout = "";
    private String stderr = "";
    private Long executionTimeMs = 0L;
    private Integer errorLine;
    private String diagnosticHint;
    private int totalTests = 0;
    private int passedTests = 0;
    private int starsEarned = 0;
    private int xpEarned = 0;
    private List<TestExecutionResultDTO> testCases = new ArrayList<>();

    public SubmissionResultDTO() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public String getStdout() { return stdout; }
    public void setStdout(String stdout) { this.stdout = stdout; }

    public String getStderr() { return stderr; }
    public void setStderr(String stderr) { this.stderr = stderr; }

    public Long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public Integer getErrorLine() { return errorLine; }
    public void setErrorLine(Integer errorLine) { this.errorLine = errorLine; }

    public String getDiagnosticHint() { return diagnosticHint; }
    public void setDiagnosticHint(String diagnosticHint) { this.diagnosticHint = diagnosticHint; }

    public int getTotalTests() { return totalTests; }
    public void setTotalTests(int totalTests) { this.totalTests = totalTests; }

    public int getPassedTests() { return passedTests; }
    public void setPassedTests(int passedTests) { this.passedTests = passedTests; }

    public int getStarsEarned() { return starsEarned; }
    public void setStarsEarned(int starsEarned) { this.starsEarned = starsEarned; }

    public int getXpEarned() { return xpEarned; }
    public void setXpEarned(int xpEarned) { this.xpEarned = xpEarned; }

    public List<TestExecutionResultDTO> getTestCases() { return testCases; }
    public void setTestCases(List<TestExecutionResultDTO> testCases) { this.testCases = testCases; }
}
