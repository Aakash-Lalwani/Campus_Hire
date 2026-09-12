package com.campushire.service;

import com.campushire.dao.ApplicationDAO;
import com.campushire.dao.InterviewDAO;
import com.campushire.enums.ApplicationStatus;
import com.campushire.enums.InterviewResult;
import com.campushire.enums.InterviewRound;
import com.campushire.enums.PlacementStatus;
import com.campushire.exception.ResourceNotFoundException;
import com.campushire.exception.ValidationException;
import com.campushire.model.Application;
import com.campushire.model.Interview;

import java.sql.SQLException;
import java.util.List;

public class InterviewService {
    private final InterviewDAO interviewDAO = new InterviewDAO();
    private final ApplicationDAO applicationDAO = new ApplicationDAO();
    private final ApplicationService applicationService = new ApplicationService();

    public List<Interview> getAllInterviews(Long applicationId, String result) throws SQLException {
        return interviewDAO.findAll(applicationId, result);
    }

    public Interview getInterviewById(Long id) throws SQLException {
        return interviewDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview with ID " + id + " not found"));
    }

    public Interview scheduleInterview(Interview interview) throws SQLException {
        validateInterview(interview);

        // Ensure application exists
        Application app = applicationDAO.findById(interview.getApplicationId())
                .orElseThrow(() -> new ValidationException("Application with ID " + interview.getApplicationId() + " not found"));

        if (app.getStatus() == ApplicationStatus.REJECTED) {
            throw new ValidationException("Cannot schedule an interview for a rejected application");
        }

        Interview created = interviewDAO.create(interview);
        return getInterviewById(created.getId());
    }

    public Interview updateInterview(Long id, Interview interview) throws SQLException {
        Interview existing = getInterviewById(id);
        interview.setId(id);
        if (interview.getApplicationId() == null) {
            interview.setApplicationId(existing.getApplicationId());
        }
        validateInterview(interview);

        interviewDAO.update(interview);

        // REQUIREMENT 8: Interview results affect application progression
        if (interview.getResult() == InterviewResult.PASSED) {
            if (interview.getRound() == InterviewRound.HR) {
                applicationService.updateStatus(existing.getApplicationId(), ApplicationStatus.SELECTED);
            } else if (interview.getRound() == InterviewRound.TECHNICAL) {
                applicationService.updateStatus(existing.getApplicationId(), ApplicationStatus.HR);
            } else if (interview.getRound() == InterviewRound.APTITUDE) {
                applicationService.updateStatus(existing.getApplicationId(), ApplicationStatus.TECHNICAL);
            }
        } else if (interview.getResult() == InterviewResult.FAILED) {
            applicationService.updateStatus(existing.getApplicationId(), ApplicationStatus.REJECTED);
        }

        return getInterviewById(id);
    }

    public void deleteInterview(Long id) throws SQLException {
        getInterviewById(id);
        interviewDAO.delete(id);
    }

    private void validateInterview(Interview i) {
        if (i.getApplicationId() == null || i.getApplicationId() <= 0) {
            throw new ValidationException("Application ID is required");
        }
        if (i.getRound() == null) {
            throw new ValidationException("Interview round is required");
        }
        if (i.getScheduledAt() == null) {
            throw new ValidationException("Scheduled date/time is required");
        }
        if (i.getMode() == null || i.getMode().isBlank()) {
            throw new ValidationException("Interview mode (ONLINE/OFFLINE) is required");
        }
    }
}
