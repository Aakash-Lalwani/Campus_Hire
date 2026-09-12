package com.campushire.controller;

import com.campushire.dto.*;
import com.campushire.enums.ApplicationStatus;
import com.campushire.enums.PlacementStatus;
import com.campushire.exception.BusinessConflictException;
import com.campushire.exception.ResourceNotFoundException;
import com.campushire.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({
    HealthController.class,
    StudentController.class,
    CompanyController.class,
    JobController.class,
    ApplicationController.class,
    InterviewController.class,
    DashboardController.class
})
class ControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StudentService studentService;

    @MockBean
    private CompanyService companyService;

    @MockBean
    private JobService jobService;

    @MockBean
    private EligibilityService eligibilityService;

    @MockBean
    private ApplicationService applicationService;

    @MockBean
    private InterviewService interviewService;

    @MockBean
    private DashboardService dashboardService;

    @Test
    @DisplayName("GET /api/health should return UP status")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.service", is("campushire-backend")));
    }

    @Test
    @DisplayName("GET /api/students should return standard ApiResponse envelope with count")
    void testGetAllStudents() throws Exception {
        StudentResponseDTO s = new StudentResponseDTO();
        s.setId(1L);
        s.setName("Test Student");
        s.setEmail("test@example.com");
        s.setBranch("CSE");
        s.setCgpa(8.5);
        s.setPlacementStatus(PlacementStatus.NOT_PLACED);

        when(studentService.getAllStudents(null, null, null)).thenReturn(List.of(s));

        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.count", is(1)))
                .andExpect(jsonPath("$.data[0].name", is("Test Student")));
    }

    @Test
    @DisplayName("GET /api/students/{id} not found returns 404 with RESOURCE_NOT_FOUND")
    void testGetStudentNotFound() throws Exception {
        when(studentService.getStudentById(999L))
                .thenThrow(new ResourceNotFoundException("Student with ID 999 not found"));

        mockMvc.perform(get("/api/students/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.errorCode", is("RESOURCE_NOT_FOUND")))
                .andExpect(jsonPath("$.message", containsString("999 not found")));
    }

    @Test
    @DisplayName("POST /api/students with invalid payload returns 400 with VALIDATION_ERROR")
    void testCreateStudentValidationFailure() throws Exception {
        StudentRequestDTO invalidDto = new StudentRequestDTO();
        // Missing name, invalid email, missing branch, missing cgpa, etc.
        invalidDto.setEmail("not-an-email");

        mockMvc.perform(post("/api/students")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.errorCode", is("VALIDATION_ERROR")));
    }

    @Test
    @DisplayName("POST /api/applications with duplicate student/job returns 409 DUPLICATE_APPLICATION")
    void testApplyJobDuplicateConflict() throws Exception {
        ApplicationRequestDTO dto = new ApplicationRequestDTO(1L, 2L);

        when(applicationService.applyForJob(1L, 2L))
                .thenThrow(new BusinessConflictException("Student ID 1 has already submitted an application for Job ID 2"));

        mockMvc.perform(post("/api/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.errorCode", is("DUPLICATE_APPLICATION")));
    }

    @Test
    @DisplayName("GET /api/dashboard/stats returns dashboard metrics")
    void testGetDashboardStats() throws Exception {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalStudents(100);
        stats.setStudentsPlaced(80);
        stats.setPlacementPercentage(80.0);

        when(dashboardService.getDashboardStats()).thenReturn(stats);

        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalStudents", is(100)))
                .andExpect(jsonPath("$.data.placementPercentage", is(80.0)));
    }
}
