package com.campushire.controller;

import com.campushire.dto.ApiResponse;
import com.campushire.dto.ApplicationRequestDTO;
import com.campushire.dto.ApplicationResponseDTO;
import com.campushire.dto.ApplicationStatusUpdateDTO;
import com.campushire.enums.ApplicationStatus;
import com.campushire.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    @Autowired
    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ApplicationResponseDTO>>> getAllApplications(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) String status) {
        List<ApplicationResponseDTO> list = applicationService.getAllApplications(studentId, jobId, status);
        return ResponseEntity.ok(ApiResponse.success(list, list.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationResponseDTO>> getApplicationById(@PathVariable Long id) {
        ApplicationResponseDTO app = applicationService.getApplicationById(id);
        return ResponseEntity.ok(ApiResponse.success(app));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ApplicationResponseDTO>> applyForJob(@Valid @RequestBody ApplicationRequestDTO dto) {
        ApplicationResponseDTO created = applicationService.applyForJob(dto.getStudentId(), dto.getJobId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ApplicationResponseDTO>> updateStatusWithSubpath(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return handleStatusUpdate(id, body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationResponseDTO>> updateStatusDirect(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return handleStatusUpdate(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.ok(ApiResponse.success("Application deleted successfully"));
    }

    private ResponseEntity<ApiResponse<ApplicationResponseDTO>> handleStatusUpdate(Long id, Map<String, String> body) {
        String statusStr = body != null ? body.get("status") : null;
        if (statusStr == null || statusStr.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("New status is required", "MISSING_STATUS"));
        }
        ApplicationStatus newStatus = ApplicationStatus.fromString(statusStr);
        ApplicationResponseDTO updated = applicationService.updateStatus(id, newStatus);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
}
