package com.campushire.controller;

import com.campushire.dto.ApiResponse;
import com.campushire.dto.InterviewRequestDTO;
import com.campushire.dto.InterviewResponseDTO;
import com.campushire.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    @Autowired
    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InterviewResponseDTO>>> getAllInterviews(
            @RequestParam(required = false) Long applicationId,
            @RequestParam(required = false) String result) {
        List<InterviewResponseDTO> list = interviewService.getAllInterviews(applicationId, result);
        return ResponseEntity.ok(ApiResponse.success(list, list.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InterviewResponseDTO>> getInterviewById(@PathVariable Long id) {
        InterviewResponseDTO interview = interviewService.getInterviewById(id);
        return ResponseEntity.ok(ApiResponse.success(interview));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InterviewResponseDTO>> scheduleInterview(@Valid @RequestBody InterviewRequestDTO dto) {
        InterviewResponseDTO created = interviewService.scheduleInterview(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InterviewResponseDTO>> updateInterview(
            @PathVariable Long id,
            @Valid @RequestBody InterviewRequestDTO dto) {
        InterviewResponseDTO updated = interviewService.updateInterview(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @PutMapping("/{id}/result")
    public ResponseEntity<ApiResponse<InterviewResponseDTO>> updateInterviewResult(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String resultStr = body != null ? body.get("result") : null;
        String remarks = body != null ? body.get("remarks") : null;
        InterviewResponseDTO existing = interviewService.getInterviewById(id);
        InterviewRequestDTO req = new InterviewRequestDTO();
        req.setApplicationId(existing.getApplicationId());
        req.setRound(existing.getRound());
        req.setScheduledAt(existing.getScheduledAt());
        req.setMode(existing.getMode());
        req.setInterviewer(existing.getInterviewer());
        req.setResult(com.campushire.enums.InterviewResult.fromString(resultStr));
        req.setRemarks(remarks != null ? remarks : existing.getRemarks());
        InterviewResponseDTO updated = interviewService.updateInterview(id, req);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteInterview(@PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.ok(ApiResponse.success("Interview deleted successfully"));
    }
}
