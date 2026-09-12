package com.campushire.controller;

import com.campushire.dto.ApiResponse;
import com.campushire.dto.EligibilityResultDTO;
import com.campushire.dto.JobRequestDTO;
import com.campushire.dto.JobResponseDTO;
import com.campushire.service.EligibilityService;
import com.campushire.service.JobService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final EligibilityService eligibilityService;

    @Autowired
    public JobController(JobService jobService, EligibilityService eligibilityService) {
        this.jobService = jobService;
        this.eligibilityService = eligibilityService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobResponseDTO>>> getAllJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) String status) {
        List<JobResponseDTO> list = jobService.getAllJobs(search, companyId, status);
        return ResponseEntity.ok(ApiResponse.success(list, list.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponseDTO>> getJobById(@PathVariable Long id) {
        JobResponseDTO job = jobService.getJobById(id);
        return ResponseEntity.ok(ApiResponse.success(job));
    }

    @GetMapping("/{jobId}/eligibility/{studentId}")
    public ResponseEntity<ApiResponse<EligibilityResultDTO>> checkEligibility(
            @PathVariable Long jobId,
            @PathVariable Long studentId) {
        EligibilityResultDTO result = eligibilityService.checkEligibility(jobId, studentId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobResponseDTO>> createJob(@Valid @RequestBody JobRequestDTO dto) {
        JobResponseDTO created = jobService.createJob(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponseDTO>> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobRequestDTO dto) {
        JobResponseDTO updated = jobService.updateJob(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job opening deleted successfully"));
    }
}
