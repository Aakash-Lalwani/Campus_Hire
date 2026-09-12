package com.campushire.service;

import com.campushire.dao.ApplicationDAO;
import com.campushire.dao.StudentDAO;
import com.campushire.dto.EligibilityResultDTO;
import com.campushire.enums.ApplicationStatus;
import com.campushire.enums.PlacementStatus;
import com.campushire.exception.BusinessConflictException;
import com.campushire.exception.ResourceNotFoundException;
import com.campushire.exception.ValidationException;
import com.campushire.model.Application;

import java.sql.SQLException;
import java.util.List;

public class ApplicationService {
    private final ApplicationDAO applicationDAO = new ApplicationDAO();
    private final StudentDAO studentDAO = new StudentDAO();
    private final EligibilityService eligibilityService = new EligibilityService();

    public List<Application> getAllApplications(Long studentId, Long jobId, String status) throws SQLException {
        return applicationDAO.findAll(studentId, jobId, status);
    }

    public Application getApplicationById(Long id) throws SQLException {
        return applicationDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application with ID " + id + " not found"));
    }

    public Application applyForJob(Long studentId, Long jobId) throws SQLException {
        // 1. Service Layer Duplicate Check
        if (applicationDAO.existsByStudentIdAndJobId(studentId, jobId)) {
            throw new BusinessConflictException("Student ID " + studentId + " has already submitted an application for Job ID " + jobId);
        }

        // 2. Eligibility Evaluation Check
        EligibilityResultDTO eligibility = eligibilityService.checkEligibility(jobId, studentId);
        if (!eligibility.isEligible()) {
            String reasonsStr = String.join(" ", eligibility.getReasons());
            throw new ValidationException("Student is not eligible for this job: " + reasonsStr);
        }

        // 3. Create Application
        Application application = new Application();
        application.setStudentId(studentId);
        application.setJobId(jobId);
        application.setStatus(ApplicationStatus.APPLIED);

        Application created = applicationDAO.create(application);
        return getApplicationById(created.getId());
    }

    public Application updateStatus(Long id, ApplicationStatus newStatus) throws SQLException {
        Application currentApp = getApplicationById(id);

        if (currentApp.getStatus() == newStatus) {
            return currentApp;
        }

        // Validate Status Transition Pipeline
        if (!currentApp.getStatus().isValidTransitionTo(newStatus)) {
            throw new ValidationException("Invalid status transition from " + currentApp.getStatus() + " to " + newStatus);
        }

        applicationDAO.updateStatus(id, newStatus);

        // REQUIREMENT 9: When application becomes SELECTED, update student placement status to PLACED
        if (newStatus == ApplicationStatus.SELECTED) {
            studentDAO.updatePlacementStatus(currentApp.getStudentId(), PlacementStatus.PLACED);
        }

        return getApplicationById(id);
    }

    public void deleteApplication(Long id) throws SQLException {
        getApplicationById(id);
        applicationDAO.delete(id);
    }
}
