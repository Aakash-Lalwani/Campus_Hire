package com.campushire.service;

import com.campushire.dto.ApplicationResponseDTO;
import com.campushire.dto.EligibilityResultDTO;
import com.campushire.entity.Application;
import com.campushire.entity.Company;
import com.campushire.entity.Job;
import com.campushire.entity.Student;
import com.campushire.enums.ApplicationStatus;
import com.campushire.enums.PlacementStatus;
import com.campushire.exception.BusinessConflictException;
import com.campushire.exception.ValidationException;
import com.campushire.repository.ApplicationRepository;
import com.campushire.repository.JobRepository;
import com.campushire.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationWorkflowTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private EligibilityService eligibilityService;

    @InjectMocks
    private ApplicationService applicationService;

    private Student student;
    private Job job;
    private Application application;

    @BeforeEach
    void setUp() {
        student = new Student();
        student.setId(1L);
        student.setName("Bob");
        student.setPlacementStatus(PlacementStatus.NOT_PLACED);

        Company company = new Company();
        company.setId(5L);
        company.setName("InnovateX");

        job = new Job();
        job.setId(2L);
        job.setCompany(company);
        job.setRole("Backend Developer");

        application = new Application(student, job, ApplicationStatus.APPLIED);
        application.setId(100L);
    }

    @Test
    @DisplayName("Successfully creates application when eligible and not duplicate")
    void testApplyForJob_Success() {
        when(applicationRepository.existsByStudentIdAndJobId(1L, 2L)).thenReturn(false);
        when(eligibilityService.checkEligibility(2L, 1L))
                .thenReturn(new EligibilityResultDTO(true, 1L, 2L, List.of()));
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(jobRepository.findById(2L)).thenReturn(Optional.of(job));
        when(applicationRepository.save(any(Application.class))).thenReturn(application);

        ApplicationResponseDTO response = applicationService.applyForJob(1L, 2L);

        assertNotNull(response);
        assertEquals(ApplicationStatus.APPLIED, response.getStatus());
        verify(applicationRepository).save(any(Application.class));
    }

    @Test
    @DisplayName("Throws BusinessConflictException on duplicate application")
    void testApplyForJob_DuplicateConflict() {
        when(applicationRepository.existsByStudentIdAndJobId(1L, 2L)).thenReturn(true);

        assertThrows(BusinessConflictException.class, () -> applicationService.applyForJob(1L, 2L));
        verify(applicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Throws ValidationException when student is ineligible")
    void testApplyForJob_Ineligible() {
        when(applicationRepository.existsByStudentIdAndJobId(1L, 2L)).thenReturn(false);
        when(eligibilityService.checkEligibility(2L, 1L))
                .thenReturn(new EligibilityResultDTO(false, 1L, 2L, List.of("CGPA below required minimum")));

        ValidationException ex = assertThrows(ValidationException.class, () -> applicationService.applyForJob(1L, 2L));
        assertTrue(ex.getMessage().contains("not eligible"));
        verify(applicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Valid status transition from APPLIED to TECHNICAL and then to HR")
    void testUpdateStatus_ValidTransition() {
        when(applicationRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));

        ApplicationResponseDTO step1 = applicationService.updateStatus(100L, ApplicationStatus.TECHNICAL);
        assertEquals(ApplicationStatus.TECHNICAL, step1.getStatus());

        ApplicationResponseDTO step2 = applicationService.updateStatus(100L, ApplicationStatus.HR);
        assertEquals(ApplicationStatus.HR, step2.getStatus());
    }

    @Test
    @DisplayName("Invalid status transition from APPLIED directly to SELECTED throws ValidationException")
    void testUpdateStatus_InvalidDirectTransitionToSelected() {
        when(applicationRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(application));

        assertThrows(ValidationException.class, () -> applicationService.updateStatus(100L, ApplicationStatus.SELECTED));
    }

    @Test
    @DisplayName("Transitioning to SELECTED synchronizes student placement status to PLACED")
    void testUpdateStatus_SelectedSynchronizesStudentPlaced() {
        application.setStatus(ApplicationStatus.HR);
        when(applicationRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));

        ApplicationResponseDTO response = applicationService.updateStatus(100L, ApplicationStatus.SELECTED);

        assertEquals(ApplicationStatus.SELECTED, response.getStatus());
        assertEquals(PlacementStatus.PLACED, student.getPlacementStatus());
        verify(studentRepository).save(student);
    }
}
