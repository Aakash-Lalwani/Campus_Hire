package com.campushire.service;

import com.campushire.dto.InterviewRequestDTO;
import com.campushire.dto.InterviewResponseDTO;
import com.campushire.entity.Application;
import com.campushire.entity.Interview;
import com.campushire.enums.ApplicationStatus;
import com.campushire.enums.InterviewResult;
import com.campushire.enums.InterviewRound;
import com.campushire.exception.ResourceNotFoundException;
import com.campushire.exception.ValidationException;
import com.campushire.repository.ApplicationRepository;
import com.campushire.repository.InterviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationService applicationService;

    @Autowired
    public InterviewService(InterviewRepository interviewRepository,
                            ApplicationRepository applicationRepository,
                            ApplicationService applicationService) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.applicationService = applicationService;
    }

    public List<InterviewResponseDTO> getAllInterviews(Long applicationId, String result) {
        InterviewResult interviewResult = null;
        if (result != null && !result.isBlank() && !"ALL".equalsIgnoreCase(result)) {
            interviewResult = InterviewResult.fromString(result);
        }

        List<Interview> interviews = interviewRepository.searchInterviews(applicationId, interviewResult);
        return interviews.stream()
                .map(InterviewResponseDTO::new)
                .toList();
    }

    public InterviewResponseDTO getInterviewById(Long id) {
        Interview interview = findEntityById(id);
        return new InterviewResponseDTO(interview);
    }

    public Interview findEntityById(Long id) {
        return interviewRepository.findByIdWithDetails(id)
                .or(() -> interviewRepository.findById(id))
                .orElseThrow(() -> new ResourceNotFoundException("Interview with ID " + id + " not found"));
    }

    @Transactional
    public InterviewResponseDTO scheduleInterview(InterviewRequestDTO dto) {
        Application app = applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ValidationException("Application with ID " + dto.getApplicationId() + " not found"));

        if (app.getStatus() == ApplicationStatus.REJECTED) {
            throw new ValidationException("Cannot schedule an interview for a rejected application");
        }

        Interview interview = new Interview(
                app,
                dto.getRound(),
                dto.getScheduledAt(),
                dto.getMode(),
                dto.getInterviewer(),
                dto.getResult() != null ? dto.getResult() : InterviewResult.PENDING,
                dto.getRemarks()
        );

        Interview saved = interviewRepository.save(interview);
        return new InterviewResponseDTO(saved);
    }

    @Transactional
    public InterviewResponseDTO updateInterview(Long id, InterviewRequestDTO dto) {
        Interview existing = findEntityById(id);

        existing.setRound(dto.getRound());
        existing.setScheduledAt(dto.getScheduledAt());
        existing.setMode(dto.getMode());
        existing.setInterviewer(dto.getInterviewer());
        existing.setResult(dto.getResult() != null ? dto.getResult() : InterviewResult.PENDING);
        existing.setRemarks(dto.getRemarks());

        Interview updated = interviewRepository.save(existing);

        // Interview results affect application progression
        Long appId = existing.getApplication().getId();
        if (existing.getResult() == InterviewResult.PASSED) {
            if (existing.getRound() == InterviewRound.HR) {
                applicationService.updateStatus(appId, ApplicationStatus.SELECTED);
            } else if (existing.getRound() == InterviewRound.TECHNICAL) {
                applicationService.updateStatus(appId, ApplicationStatus.HR);
            } else if (existing.getRound() == InterviewRound.APTITUDE) {
                applicationService.updateStatus(appId, ApplicationStatus.TECHNICAL);
            }
        } else if (existing.getResult() == InterviewResult.FAILED) {
            applicationService.updateStatus(appId, ApplicationStatus.REJECTED);
        }

        return new InterviewResponseDTO(updated);
    }

    @Transactional
    public void deleteInterview(Long id) {
        Interview interview = findEntityById(id);
        interviewRepository.delete(interview);
    }
}
