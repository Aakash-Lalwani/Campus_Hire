package com.campushire.service;

import com.campushire.dto.EligibilityResultDTO;
import com.campushire.entity.Company;
import com.campushire.entity.Job;
import com.campushire.entity.Student;
import com.campushire.enums.JobStatus;
import com.campushire.enums.PlacementStatus;
import com.campushire.repository.JobRepository;
import com.campushire.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EligibilityServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private EligibilityService eligibilityService;

    private Student student;
    private Job job;

    @BeforeEach
    void setUp() {
        student = new Student();
        student.setId(1L);
        student.setName("Alice");
        student.setEmail("alice@test.com");
        student.setBranch("CSE");
        student.setCgpa(8.5);
        student.setGraduationYear(2026);
        student.setBacklogs(0);
        student.setPlacementStatus(PlacementStatus.NOT_PLACED);

        Company company = new Company();
        company.setId(1L);
        company.setName("TechCorp");

        job = new Job();
        job.setId(10L);
        job.setCompany(company);
        job.setRole("SDE 1");
        job.setMinCgpa(7.0);
        job.setAllowedBranches("CSE,IT");
        job.setMaxBacklogs(0);
        job.setApplicationDeadline(LocalDate.now().plusMonths(1));
        job.setJobStatus(JobStatus.OPEN);
    }

    @Test
    @DisplayName("Eligible student meets all criteria")
    void testCheckEligibility_Success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        EligibilityResultDTO result = eligibilityService.checkEligibility(10L, 1L);

        assertTrue(result.isEligible());
        assertTrue(result.getReasons().isEmpty());
    }

    @Test
    @DisplayName("Ineligible when job is closed")
    void testCheckEligibility_JobClosed() {
        job.setJobStatus(JobStatus.CLOSED);

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        EligibilityResultDTO result = eligibilityService.checkEligibility(10L, 1L);

        assertFalse(result.isEligible());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("CLOSED")));
    }

    @Test
    @DisplayName("Ineligible when application deadline has expired")
    void testCheckEligibility_DeadlineExpired() {
        job.setApplicationDeadline(LocalDate.now().minusDays(2));

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        EligibilityResultDTO result = eligibilityService.checkEligibility(10L, 1L);

        assertFalse(result.isEligible());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("expired")));
    }

    @Test
    @DisplayName("Ineligible when student CGPA is below minimum required")
    void testCheckEligibility_LowCgpa() {
        student.setCgpa(6.5);

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        EligibilityResultDTO result = eligibilityService.checkEligibility(10L, 1L);

        assertFalse(result.isEligible());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("below the required minimum")));
    }

    @Test
    @DisplayName("Ineligible when student branch is not in allowed branches")
    void testCheckEligibility_WrongBranch() {
        student.setBranch("MECH");

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        EligibilityResultDTO result = eligibilityService.checkEligibility(10L, 1L);

        assertFalse(result.isEligible());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("is not eligible")));
    }

    @Test
    @DisplayName("Eligible when allowed branches is ALL")
    void testCheckEligibility_AllowedBranchesAll() {
        student.setBranch("CIVIL");
        job.setAllowedBranches("ALL");

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        EligibilityResultDTO result = eligibilityService.checkEligibility(10L, 1L);

        assertTrue(result.isEligible());
    }

    @Test
    @DisplayName("Ineligible when student has more backlogs than allowed limit")
    void testCheckEligibility_ExcessBacklogs() {
        student.setBacklogs(2);
        job.setMaxBacklogs(1);

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        EligibilityResultDTO result = eligibilityService.checkEligibility(10L, 1L);

        assertFalse(result.isEligible());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("exceeding the maximum allowed")));
    }

    @Test
    @DisplayName("Multiple failure conditions report all respective reasons")
    void testCheckEligibility_MultipleFailures() {
        student.setCgpa(5.0);
        student.setBranch("ECE");
        student.setBacklogs(3);

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        EligibilityResultDTO result = eligibilityService.checkEligibility(10L, 1L);

        assertFalse(result.isEligible());
        assertEquals(3, result.getReasons().size());
    }
}
