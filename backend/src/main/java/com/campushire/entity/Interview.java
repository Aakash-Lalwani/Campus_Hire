package com.campushire.entity;

import com.campushire.enums.InterviewResult;
import com.campushire.enums.InterviewRound;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interviews", indexes = {
    @Index(name = "idx_interviews_application", columnList = "application_id")
})
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InterviewRound round;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(nullable = false, length = 30)
    private String mode;

    @Column(length = 100)
    private String interviewer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InterviewResult result = InterviewResult.PENDING;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    public Interview() {}

    public Interview(Application application, InterviewRound round, LocalDateTime scheduledAt, String mode, String interviewer, InterviewResult result, String remarks) {
        this.application = application;
        this.round = round;
        this.scheduledAt = scheduledAt;
        this.mode = mode;
        this.interviewer = interviewer;
        this.result = result != null ? result : InterviewResult.PENDING;
        this.remarks = remarks;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

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
