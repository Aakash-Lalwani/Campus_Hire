package com.campushire.dto;

import java.util.ArrayList;
import java.util.List;

public class EligibilityResultDTO {
    private boolean eligible;
    private Long studentId;
    private Long jobId;
    private List<String> reasons;

    public EligibilityResultDTO() {
        this.reasons = new ArrayList<>();
    }

    public EligibilityResultDTO(boolean eligible, Long studentId, Long jobId, List<String> reasons) {
        this.eligible = eligible;
        this.studentId = studentId;
        this.jobId = jobId;
        this.reasons = reasons != null ? reasons : new ArrayList<>();
    }

    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }
}
