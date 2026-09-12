package com.campushire.model;

import com.campushire.enums.InterviewRound;
import com.campushire.enums.InterviewResult;
import java.sql.Timestamp;

public class Interview {
    private Long id;
    private Long applicationId;
    private String studentName; // Joined field
    private String companyName; // Joined field
    private String jobRole;     // Joined field
    private InterviewRound round;
    private Timestamp scheduledAt;
    private String mode;
    private String interviewer;
    private InterviewResult result;
    private String remarks;

    public Interview() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public InterviewRound getRound() { return round; }
    public void setRound(InterviewRound round) { this.round = round; }

    public Timestamp getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Timestamp scheduledAt) { this.scheduledAt = scheduledAt; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getInterviewer() { return interviewer; }
    public void setInterviewer(String interviewer) { this.interviewer = interviewer; }

    public InterviewResult getResult() { return result; }
    public void setResult(InterviewResult result) { this.result = result; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
