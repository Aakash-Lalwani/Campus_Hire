package com.campushire.controller;

import com.campushire.dto.*;
import com.campushire.enums.ApplicationStatus;
import com.campushire.enums.InterviewResult;
import com.campushire.enums.InterviewRound;
import com.campushire.enums.JobStatus;
import com.campushire.enums.PlacementStatus;
import com.campushire.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-end smoke test verifying every single REST controller endpoint contract.
 */
@WebMvcTest({
    HealthController.class,
    StudentController.class,
    CompanyController.class,
    JobController.class,
    ApplicationController.class,
    InterviewController.class,
    DashboardController.class
})
class ApiEndpointsSmokeTest {

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

    // 1. Health Endpoint
    @Test
    @DisplayName("Smoke Test: GET /api/health")
    void smokeHealth() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")));
    }

    // 2. Student Endpoints
    @Test
    @DisplayName("Smoke Test: Student CRUD endpoints")
    void smokeStudentEndpoints() throws Exception {
        StudentResponseDTO resp = new StudentResponseDTO();
        resp.setId(1L);
        resp.setName("Rahul Sharma");
        resp.setEmail("rahul@example.com");
        resp.setBranch("CSE");
        resp.setCgpa(8.5);
        resp.setPlacementStatus(PlacementStatus.NOT_PLACED);

        when(studentService.getAllStudents(any(), any(), any())).thenReturn(List.of(resp));
        when(studentService.getStudentById(1L)).thenReturn(resp);
        when(studentService.createStudent(any())).thenReturn(resp);
        when(studentService.updateStudent(eq(1L), any())).thenReturn(resp);
        doNothing().when(studentService).deleteStudent(1L);

        // GET /api/students
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.count", is(1)));

        // GET /api/students/{id}
        mockMvc.perform(get("/api/students/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id", is(1)));

        // POST /api/students
        StudentRequestDTO req = new StudentRequestDTO();
        req.setName("Rahul Sharma");
        req.setEmail("rahul@example.com");
        req.setPhone("9876543210");
        req.setBranch("CSE");
        req.setCgpa(8.5);
        req.setBacklogs(0);
        req.setGraduationYear(2025);
        req.setSkills("Java");

        mockMvc.perform(post("/api/students")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)));

        // PUT /api/students/{id}
        mockMvc.perform(put("/api/students/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // DELETE /api/students/{id}
        mockMvc.perform(delete("/api/students/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    // 3. Company Endpoints
    @Test
    @DisplayName("Smoke Test: Company CRUD endpoints")
    void smokeCompanyEndpoints() throws Exception {
        CompanyResponseDTO resp = new CompanyResponseDTO();
        resp.setId(1L);
        resp.setName("Google");
        resp.setWebsite("https://google.com");
        resp.setLocation("Mountain View");
        resp.setIndustry("Tech");

        when(companyService.getAllCompanies(any())).thenReturn(List.of(resp));
        when(companyService.getCompanyById(1L)).thenReturn(resp);
        when(companyService.createCompany(any())).thenReturn(resp);
        when(companyService.updateCompany(eq(1L), any())).thenReturn(resp);
        doNothing().when(companyService).deleteCompany(1L);

        // GET /api/companies
        mockMvc.perform(get("/api/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.count", is(1)));

        // GET /api/companies/{id}
        mockMvc.perform(get("/api/companies/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name", is("Google")));

        // POST /api/companies
        CompanyRequestDTO req = new CompanyRequestDTO();
        req.setName("Google");
        req.setWebsite("https://google.com");
        req.setLocation("Mountain View");
        req.setIndustry("Tech");
        req.setContactPerson("Larry");
        req.setContactEmail("hr@google.com");

        mockMvc.perform(post("/api/companies")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)));

        // PUT /api/companies/{id}
        mockMvc.perform(put("/api/companies/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // DELETE /api/companies/{id}
        mockMvc.perform(delete("/api/companies/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    // 4. Job Endpoints & Eligibility
    @Test
    @DisplayName("Smoke Test: Job CRUD & Eligibility endpoints")
    void smokeJobEndpoints() throws Exception {
        JobResponseDTO resp = new JobResponseDTO();
        resp.setId(1L);
        resp.setCompanyId(1L);
        resp.setCompanyName("Google");
        resp.setRole("SWE");
        resp.setDescription("Dev role");
        resp.setPackageLpa(25.0);
        resp.setMinCgpa(7.5);
        resp.setMaxBacklogs(0);
        resp.setAllowedBranches("CSE,IT");
        resp.setJobStatus(JobStatus.OPEN);

        when(jobService.getAllJobs(any(), any(), any())).thenReturn(List.of(resp));
        when(jobService.getJobById(1L)).thenReturn(resp);
        when(jobService.createJob(any())).thenReturn(resp);
        when(jobService.updateJob(eq(1L), any())).thenReturn(resp);
        doNothing().when(jobService).deleteJob(1L);

        EligibilityResultDTO elig = new EligibilityResultDTO(true, 1L, 1L, List.of());
        when(eligibilityService.checkEligibility(1L, 1L)).thenReturn(elig);

        // GET /api/jobs
        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.count", is(1)));

        // GET /api/jobs/{id}
        mockMvc.perform(get("/api/jobs/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role", is("SWE")));

        // POST /api/jobs
        JobRequestDTO req = new JobRequestDTO();
        req.setCompanyId(1L);
        req.setRole("SWE");
        req.setDescription("Dev role");
        req.setPackageLpa(25.0);
        req.setMinCgpa(7.5);
        req.setMaxBacklogs(0);
        req.setAllowedBranches("CSE,IT");
        req.setApplicationDeadline(LocalDate.now().plusDays(10));
        req.setJobStatus(JobStatus.OPEN);

        mockMvc.perform(post("/api/jobs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)));

        // PUT /api/jobs/{id}
        mockMvc.perform(put("/api/jobs/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // DELETE /api/jobs/{id}
        mockMvc.perform(delete("/api/jobs/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // GET /api/jobs/{jobId}/eligibility/{studentId}
        mockMvc.perform(get("/api/jobs/1/eligibility/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.eligible", is(true)));
    }

    // 5. Application Endpoints
    @Test
    @DisplayName("Smoke Test: Application endpoints")
    void smokeApplicationEndpoints() throws Exception {
        ApplicationResponseDTO resp = new ApplicationResponseDTO();
        resp.setId(1L);
        resp.setStudentId(1L);
        resp.setStudentName("Rahul Sharma");
        resp.setStudentBranch("CSE");
        resp.setStudentCgpa(8.5);
        resp.setJobId(1L);
        resp.setJobRole("SWE");
        resp.setCompanyName("Google");
        resp.setStatus(ApplicationStatus.APPLIED);
        resp.setAppliedAt(LocalDateTime.now());

        when(applicationService.getAllApplications(any(), any(), any())).thenReturn(List.of(resp));
        when(applicationService.getApplicationById(1L)).thenReturn(resp);
        when(applicationService.applyForJob(1L, 1L)).thenReturn(resp);
        when(applicationService.updateStatus(eq(1L), any())).thenReturn(resp);

        // GET /api/applications
        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.count", is(1)));

        // GET /api/applications/{id}
        mockMvc.perform(get("/api/applications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.studentName", is("Rahul Sharma")));

        // POST /api/applications
        ApplicationRequestDTO req = new ApplicationRequestDTO(1L, 1L);
        mockMvc.perform(post("/api/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)));

        // PUT /api/applications/{id}/status
        ApplicationStatusUpdateDTO statusReq = new ApplicationStatusUpdateDTO(ApplicationStatus.SHORTLISTED);
        mockMvc.perform(put("/api/applications/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    // 6. Interview Endpoints
    @Test
    @DisplayName("Smoke Test: Interview endpoints")
    void smokeInterviewEndpoints() throws Exception {
        InterviewResponseDTO resp = new InterviewResponseDTO();
        resp.setId(1L);
        resp.setApplicationId(1L);
        resp.setStudentName("Rahul Sharma");
        resp.setCompanyName("Google");
        resp.setJobRole("SWE");
        resp.setRound(InterviewRound.TECHNICAL);
        resp.setScheduledAt(LocalDateTime.now().plusDays(2));
        resp.setMode("ONLINE");
        resp.setInterviewer("Tech Lead");
        resp.setResult(InterviewResult.PENDING);
        resp.setRemarks("Good");

        when(interviewService.getAllInterviews(any(), any())).thenReturn(List.of(resp));
        when(interviewService.getInterviewById(1L)).thenReturn(resp);
        when(interviewService.scheduleInterview(any())).thenReturn(resp);
        when(interviewService.updateInterview(eq(1L), any())).thenReturn(resp);
        doNothing().when(interviewService).deleteInterview(1L);

        // GET /api/interviews
        mockMvc.perform(get("/api/interviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.count", is(1)));

        // GET /api/interviews/{id}
        mockMvc.perform(get("/api/interviews/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.round", is("TECHNICAL")));

        // POST /api/interviews
        InterviewRequestDTO req = new InterviewRequestDTO();
        req.setApplicationId(1L);
        req.setRound(InterviewRound.TECHNICAL);
        req.setScheduledAt(LocalDateTime.now().plusDays(2));
        req.setMode("ONLINE");
        req.setInterviewer("Tech Lead");
        req.setRemarks("Pending round");

        mockMvc.perform(post("/api/interviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)));

        // PUT /api/interviews/{id}
        req.setResult(InterviewResult.PASSED);
        req.setRemarks("Great performance");
        when(interviewService.updateInterview(eq(1L), any())).thenReturn(resp);

        mockMvc.perform(put("/api/interviews/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // DELETE /api/interviews/{id}
        mockMvc.perform(delete("/api/interviews/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    // 7. Dashboard Endpoints
    @Test
    @DisplayName("Smoke Test: Dashboard aggregated endpoints")
    void smokeDashboardEndpoints() throws Exception {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalStudents(100);
        stats.setStudentsPlaced(70);
        stats.setTotalCompanies(10);
        stats.setOpenJobs(5);
        stats.setTotalApplications(200);
        stats.setPlacementPercentage(70.0);

        when(dashboardService.getDashboardStats()).thenReturn(stats);
        when(dashboardService.getPlacementsByBranch()).thenReturn(List.of(Map.of("branch", "CSE", "total", 50, "placed", 40)));
        when(dashboardService.getApplicationsByCompany()).thenReturn(List.of(Map.of("companyName", "Google", "applicationsCount", 20)));
        when(dashboardService.getPackageDistribution()).thenReturn(List.of(Map.of("range", "10-20 LPA", "count", 15)));

        // GET /api/dashboard
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalStudents", is(100)));

        // GET /api/dashboard/stats
        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.placementPercentage", is(70.0)));

        // GET /api/dashboard/placements-by-branch
        mockMvc.perform(get("/api/dashboard/placements-by-branch"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data[0].branch", is("CSE")));

        // GET /api/dashboard/applications-by-company
        mockMvc.perform(get("/api/dashboard/applications-by-company"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data[0].companyName", is("Google")));

        // GET /api/dashboard/package-distribution
        mockMvc.perform(get("/api/dashboard/package-distribution"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data[0].range", is("10-20 LPA")));
    }
}
