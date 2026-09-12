package com.campushire.dto;

import com.campushire.enums.JobStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class JobRequestDTO {

    @NotNull(message = "Company ID is required")
    @Positive(message = "Company ID must be positive")
    private Long companyId;

    @NotBlank(message = "Job role title is required")
    @Size(max = 150, message = "Role title must not exceed 150 characters")
    private String role;

    private String description;

    @NotNull(message = "Package (LPA) is required")
    @Positive(message = "Package (LPA) must be greater than 0")
    private Double packageLpa;

    @NotNull(message = "Minimum CGPA is required")
    @DecimalMin(value = "0.0", message = "Minimum CGPA must be between 0.0 and 10.0")
    @DecimalMax(value = "10.0", message = "Minimum CGPA must be between 0.0 and 10.0")
    private Double minCgpa;

    @NotBlank(message = "Allowed branches must be specified")
    @Size(max = 255, message = "Allowed branches must not exceed 255 characters")
    private String allowedBranches;

    @NotNull(message = "Max backlogs is required")
    @Min(value = 0, message = "Max backlogs cannot be negative")
    private Integer maxBacklogs = 0;

    @NotNull(message = "Application deadline date is required")
    private LocalDate applicationDeadline;

    private JobStatus jobStatus = JobStatus.OPEN;

    public JobRequestDTO() {}

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

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
}
