package com.campushire.service;

import com.campushire.dto.EligibilityResultDTO;
import com.campushire.entity.Job;
import com.campushire.entity.Student;
import com.campushire.enums.JobStatus;
import com.campushire.exception.ResourceNotFoundException;
import com.campushire.repository.JobRepository;
import com.campushire.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class EligibilityService {

    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;

    @Autowired
    public EligibilityService(StudentRepository studentRepository, JobRepository jobRepository) {
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
    }

    public EligibilityResultDTO checkEligibility(Long jobId, Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student with ID " + studentId + " not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job opening with ID " + jobId + " not found"));

        List<String> reasons = new ArrayList<>();
        boolean eligible = true;

        // 1. Job Status check
        if (job.getJobStatus() != JobStatus.OPEN) {
            eligible = false;
            reasons.add("Job position is currently CLOSED.");
        }

        // 2. Application Deadline check
        if (job.getApplicationDeadline() != null) {
            LocalDate deadline = job.getApplicationDeadline();
            LocalDate today = LocalDate.now();
            if (today.isAfter(deadline)) {
                eligible = false;
                reasons.add("Application deadline (" + deadline + ") has expired.");
            }
        }

        // 3. Minimum CGPA check
        if (student.getCgpa() == null || student.getCgpa() < job.getMinCgpa()) {
            eligible = false;
            reasons.add("CGPA (" + (student.getCgpa() != null ? student.getCgpa() : 0.0) + ") is below the required minimum (" + job.getMinCgpa() + ").");
        }

        // 4. Allowed Branches check
        if (job.getAllowedBranches() != null && !job.getAllowedBranches().isBlank()) {
            List<String> allowedList = Arrays.stream(job.getAllowedBranches().split(","))
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .toList();

            String studentBranch = student.getBranch() != null ? student.getBranch().trim().toUpperCase() : "";
            if (!allowedList.contains(studentBranch) && !allowedList.contains("ALL")) {
                eligible = false;
                reasons.add("Branch '" + student.getBranch() + "' is not eligible. Allowed: " + job.getAllowedBranches());
            }
        }

        // 5. Maximum Backlogs check
        int studentBacklogs = student.getBacklogs() != null ? student.getBacklogs() : 0;
        int maxBacklogs = job.getMaxBacklogs() != null ? job.getMaxBacklogs() : 0;
        if (studentBacklogs > maxBacklogs) {
            eligible = false;
            reasons.add("Student has " + studentBacklogs + " backlog(s), exceeding the maximum allowed (" + maxBacklogs + ").");
        }

        return new EligibilityResultDTO(eligible, studentId, jobId, reasons);
    }
}
