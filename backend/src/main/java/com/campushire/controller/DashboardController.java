package com.campushire.controller;

import com.campushire.dto.ApiResponse;
import com.campushire.dto.DashboardStatsDTO;
import com.campushire.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @Autowired
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping({"", "/stats"})
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats() {
        DashboardStatsDTO stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/placements-by-branch")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPlacementsByBranch() {
        List<Map<String, Object>> list = dashboardService.getPlacementsByBranch();
        return ResponseEntity.ok(ApiResponse.success(list, list.size()));
    }

    @GetMapping("/applications-by-company")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getApplicationsByCompany() {
        List<Map<String, Object>> list = dashboardService.getApplicationsByCompany();
        return ResponseEntity.ok(ApiResponse.success(list, list.size()));
    }

    @GetMapping("/package-distribution")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPackageDistribution() {
        List<Map<String, Object>> list = dashboardService.getPackageDistribution();
        return ResponseEntity.ok(ApiResponse.success(list, list.size()));
    }
}
