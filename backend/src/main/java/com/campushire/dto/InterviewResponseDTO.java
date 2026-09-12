package com.campushire.dto;

import com.campushire.entity.Interview;
import com.campushire.enums.InterviewResult;
import com.campushire.enums.InterviewRound;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class InterviewResponseDTO {
    private Long id;
    private Long applicationId;
    private String studentName; // Flattened for React UI
    private String companyName; // Flattened for React UI
    private String jobRole;     // Flattened for React UI
    private InterviewRound round;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime scheduledAt;

    private String mode;
    private String interviewer;
    private InterviewResult result;
    private String remarks;

    public InterviewResponseDTO() {}

    public InterviewResponseDTO(Interview i) {
        if (i != null) {
            this.id = i.getId();
            if (i.getApplication() != null) {
                this.applicationId = i.getApplication().getId();
                if (i.getApplication().getStudent() != null) {
                    this.studentName = i.getApplication().getStudent().getName();
                }
                if (i.getApplication().getJob() != null) {
                    this.jobRole = i.getApplication().getJob().getRole();
                    if (i.getApplication().getJob().getCompany() != null) {
                        this.companyName = i.getApplication().getJob().getCompany().getName();
                    }
                }
            }
            this.round = i.getRound();
            this.scheduledAt = i.getScheduledAt();
            this.mode = i.getMode();
            this.interviewer = i.getInterviewer();
            this.result = i.getResult();
            this.remarks = i.getRemarks();
        }
    }

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

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getInterviewer() { return interviewer; }
    public void setInterviewer(String interviewer) { this.interviewer = interviewer; }

    public InterviewResult getResult() { return result; }
    public void setResult(InterviewResult result) { this.result = result; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
