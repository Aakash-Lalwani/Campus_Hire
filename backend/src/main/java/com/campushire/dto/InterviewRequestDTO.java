package com.campushire.dto;

import com.campushire.enums.InterviewResult;
import com.campushire.enums.InterviewRound;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class InterviewRequestDTO {

    @NotNull(message = "Application ID is required")
    @Positive(message = "Application ID must be positive")
    private Long applicationId;

    @NotNull(message = "Interview round is required")
    private InterviewRound round;

    @NotNull(message = "Scheduled date/time is required")
    @JsonFormat(pattern = "[yyyy-MM-dd HH:mm:ss][yyyy-MM-dd'T'HH:mm:ss][yyyy-MM-dd'T'HH:mm][yyyy-MM-dd HH:mm]")
    private LocalDateTime scheduledAt;

    @NotBlank(message = "Interview mode (ONLINE/OFFLINE) is required")
    @Size(max = 30, message = "Mode must not exceed 30 characters")
    private String mode;

    @Size(max = 100, message = "Interviewer name must not exceed 100 characters")
    private String interviewer;

    private InterviewResult result = InterviewResult.PENDING;

    private String remarks;

    public InterviewRequestDTO() {}

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

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
