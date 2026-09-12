package com.campushire.repository;

import com.campushire.entity.*;
import com.campushire.enums.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class RepositoryMappingTest {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Test
    @DisplayName("Should successfully persist and query all entities with relationships")
    void testEntityLifecycleAndRelationships() {
        // 1. Create and persist Student
        Student student = new Student(
            null,
            "Test Candidate",
            "test.candidate@test.com",
            "9876543210",
            "CSE",
            8.50,
            2026,
            0,
            "Java, Spring Boot, MySQL",
            PlacementStatus.NOT_PLACED
        );
        Student savedStudent = studentRepository.save(student);
        assertNotNull(savedStudent.getId());
        assertTrue(studentRepository.existsByEmail("test.candidate@test.com"));

        // 2. Create and persist Company
        Company company = new Company(
            null,
            "Acme Innovations",
            "Software & Cloud",
            "Bangalore",
            "https://acme.example.com",
            "Jane Doe",
            "careers@acme.example.com"
        );
        Company savedCompany = companyRepository.save(company);
        assertNotNull(savedCompany.getId());
        assertEquals("Acme Innovations", savedCompany.getName());

        // 3. Create and persist Job
        Job job = new Job();
        job.setCompany(savedCompany);
        job.setRole("Full Stack Engineer");
        job.setDescription("Build enterprise services");
        job.setPackageLpa(12.50);
        job.setMinCgpa(7.50);
        job.setAllowedBranches("CSE,IT,AI-ML");
        job.setMaxBacklogs(0);
        job.setApplicationDeadline(LocalDate.now().plusMonths(2));
        job.setJobStatus(JobStatus.OPEN);
        Job savedJob = jobRepository.save(job);
        assertNotNull(savedJob.getId());
        assertEquals(savedCompany.getId(), savedJob.getCompany().getId());

        // 4. Create and persist Application
        Application application = new Application(savedStudent, savedJob, ApplicationStatus.APPLIED);
        Application savedApp = applicationRepository.save(application);
        assertNotNull(savedApp.getId());
        assertTrue(applicationRepository.existsByStudentIdAndJobId(savedStudent.getId(), savedJob.getId()));

        // 5. Create and persist Interview
        Interview interview = new Interview(
            savedApp,
            InterviewRound.TECHNICAL,
            LocalDateTime.now().plusDays(3),
            "ONLINE",
            "Lead Architect",
            InterviewResult.PENDING,
            "System design & algorithms"
        );
        Interview savedInterview = interviewRepository.save(interview);
        assertNotNull(savedInterview.getId());
        assertEquals(savedApp.getId(), savedInterview.getApplication().getId());

        // 6. Test derived / JPQL search queries
        List<Student> searchStudents = studentRepository.searchStudents("Candidate", "CSE", PlacementStatus.NOT_PLACED);
        assertFalse(searchStudents.isEmpty());
        assertEquals(savedStudent.getId(), searchStudents.get(0).getId());

        List<Job> searchJobs = jobRepository.searchJobs("Full Stack", savedCompany.getId(), JobStatus.OPEN);
        assertFalse(searchJobs.isEmpty());
        assertEquals("Acme Innovations", searchJobs.get(0).getCompany().getName());

        List<Application> searchApps = applicationRepository.searchApplications(savedStudent.getId(), savedJob.getId(), ApplicationStatus.APPLIED);
        assertFalse(searchApps.isEmpty());
        assertEquals("Test Candidate", searchApps.get(0).getStudent().getName());

        List<Interview> searchInts = interviewRepository.searchInterviews(savedApp.getId(), InterviewResult.PENDING);
        assertFalse(searchInts.isEmpty());
        assertEquals(InterviewRound.TECHNICAL, searchInts.get(0).getRound());
    }

    @Test
    @DisplayName("Should test dashboard projection queries")
    void testDashboardProjections() {
        // Persist student to test branch projection
        Student student = new Student(
            null,
            "Placed Candidate",
            "placed@test.com",
            "9999999999",
            "IT",
            9.20,
            2026,
            0,
            "Java",
            PlacementStatus.PLACED
        );
        studentRepository.save(student);

        List<StudentRepository.BranchPlacementProjection> branchStats = studentRepository.countPlacementsByBranch();
        assertNotNull(branchStats);
        assertTrue(branchStats.stream().anyMatch(b -> "IT".equals(b.getBranch())));

        List<JobRepository.PackageDistributionProjection> pkgStats = jobRepository.countPackageDistribution();
        assertNotNull(pkgStats);
    }
}
