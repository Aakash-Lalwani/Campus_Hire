package com.campushire.dto;

import com.campushire.entity.Application;
import com.campushire.enums.ApplicationStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class ApplicationResponseDTO {
    private Long id;
    private Long studentId;
    private String studentName;   // Flattened for React UI
    private String studentBranch; // Flattened for React UI
    private Double studentCgpa;   // Flattened for React UI
    private Long jobId;
    private String jobRole;       // Flattened for React UI
    private String companyName;   // Flattened for React UI
    private ApplicationStatus status;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime appliedAt;

    public ApplicationResponseDTO() {}

    public ApplicationResponseDTO(Application a) {
        if (a != null) {
            this.id = a.getId();
            if (a.getStudent() != null) {
                this.studentId = a.getStudent().getId();
                this.studentName = a.getStudent().getName();
                this.studentBranch = a.getStudent().getBranch();
                this.studentCgpa = a.getStudent().getCgpa();
            }
            if (a.getJob() != null) {
                this.jobId = a.getJob().getId();
                this.jobRole = a.getJob().getRole();
                if (a.getJob().getCompany() != null) {
                    this.companyName = a.getJob().getCompany().getName();
                }
            }
            this.status = a.getStatus();
            this.appliedAt = a.getAppliedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentBranch() { return studentBranch; }
    public void setStudentBranch(String studentBranch) { this.studentBranch = studentBranch; }

    public Double getStudentCgpa() { return studentCgpa; }
    public void setStudentCgpa(Double studentCgpa) { this.studentCgpa = studentCgpa; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
}
