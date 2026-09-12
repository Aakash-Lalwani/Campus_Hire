package com.campushire.dto;

import com.campushire.entity.Job;
import com.campushire.enums.JobStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobResponseDTO {
    private Long id;
    private Long companyId;
    private String companyName; // Preserved joined field for React UI
    private String role;
    private String description;
    private Double packageLpa;
    private Double minCgpa;
    private String allowedBranches;
    private Integer maxBacklogs;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate applicationDeadline;

    private JobStatus jobStatus;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    public JobResponseDTO() {}

    public JobResponseDTO(Job j) {
        if (j != null) {
            this.id = j.getId();
            if (j.getCompany() != null) {
                this.companyId = j.getCompany().getId();
                this.companyName = j.getCompany().getName();
            }
            this.role = j.getRole();
            this.description = j.getDescription();
            this.packageLpa = j.getPackageLpa();
            this.minCgpa = j.getMinCgpa();
            this.allowedBranches = j.getAllowedBranches();
            this.maxBacklogs = j.getMaxBacklogs();
            this.applicationDeadline = j.getApplicationDeadline();
            this.jobStatus = j.getJobStatus();
            this.createdAt = j.getCreatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPackageLpa() { return packageLpa; }
    public void setPackageLpa(Double packageLpa) { this.packageLpa = packageLpa; }

    public Double getMinCgpa() { return minCgpa; }
    public void setMinCgpa(Double minCgpa) { this.minCgpa = minCgpa; }

    public String getAllowedBranches() { return allowedBranches; }
    public void setAllowedBranches(String allowedBranches) { this.allowedBranches = allowedBranches; }

    public Integer getMaxBacklogs() { return maxBacklogs; }
    public void setMaxBacklogs(Integer maxBacklogs) { this.maxBacklogs = maxBacklogs; }

    public LocalDate getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public JobStatus getJobStatus() { return jobStatus; }
    public void setJobStatus(JobStatus jobStatus) { this.jobStatus = jobStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
