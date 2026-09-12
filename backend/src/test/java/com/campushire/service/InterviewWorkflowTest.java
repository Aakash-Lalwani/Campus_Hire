package com.campushire.service;

import com.campushire.dto.InterviewRequestDTO;
import com.campushire.dto.InterviewResponseDTO;
import com.campushire.entity.Application;
import com.campushire.entity.Interview;
import com.campushire.enums.ApplicationStatus;
import com.campushire.enums.InterviewResult;
import com.campushire.enums.InterviewRound;
import com.campushire.exception.ValidationException;
import com.campushire.repository.ApplicationRepository;
import com.campushire.repository.InterviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterviewWorkflowTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ApplicationService applicationService;

    @InjectMocks
    private InterviewService interviewService;

    private Application application;
    private Interview interview;

    @BeforeEach
    void setUp() {
        application = new Application();
        application.setId(10L);
        application.setStatus(ApplicationStatus.APPLIED);

        interview = new Interview();
        interview.setId(50L);
        interview.setApplication(application);
        interview.setRound(InterviewRound.APTITUDE);
        interview.setResult(InterviewResult.PENDING);
        interview.setScheduledAt(LocalDateTime.now().plusDays(1));
        interview.setMode("ONLINE");
    }

    @Test
    @DisplayName("Cannot schedule interview for a rejected application")
    void testScheduleInterview_RejectedApplicationThrows() {
        application.setStatus(ApplicationStatus.REJECTED);
        when(applicationRepository.findById(10L)).thenReturn(Optional.of(application));

        InterviewRequestDTO dto = new InterviewRequestDTO();
        dto.setApplicationId(10L);
        dto.setRound(InterviewRound.TECHNICAL);
        dto.setMode("ONLINE");
        dto.setScheduledAt(LocalDateTime.now().plusDays(1));

        assertThrows(ValidationException.class, () -> interviewService.scheduleInterview(dto));
        verify(interviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Passing aptitude round advances application to TECHNICAL")
    void testUpdateInterview_PassAptitudeAdvancesToTechnical() {
        when(interviewRepository.findByIdWithDetails(50L)).thenReturn(Optional.of(interview));
        when(interviewRepository.save(any(Interview.class))).thenAnswer(i -> i.getArgument(0));

        InterviewRequestDTO dto = new InterviewRequestDTO();
        dto.setRound(InterviewRound.APTITUDE);
        dto.setResult(InterviewResult.PASSED);
        dto.setScheduledAt(interview.getScheduledAt());
        dto.setMode(interview.getMode());

        interviewService.updateInterview(50L, dto);

        verify(applicationService).updateStatus(10L, ApplicationStatus.TECHNICAL);
    }

    @Test
    @DisplayName("Failing interview moves application to REJECTED")
    void testUpdateInterview_FailedMovesToRejected() {
        when(interviewRepository.findByIdWithDetails(50L)).thenReturn(Optional.of(interview));
        when(interviewRepository.save(any(Interview.class))).thenAnswer(i -> i.getArgument(0));

        InterviewRequestDTO dto = new InterviewRequestDTO();
        dto.setRound(InterviewRound.TECHNICAL);
        dto.setResult(InterviewResult.FAILED);
        dto.setScheduledAt(interview.getScheduledAt());
        dto.setMode(interview.getMode());

        interviewService.updateInterview(50L, dto);

        verify(applicationService).updateStatus(10L, ApplicationStatus.REJECTED);
    }
}
