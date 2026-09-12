package com.campushire.service;

import com.campushire.dto.ApplicationResponseDTO;
import com.campushire.dto.EligibilityResultDTO;
import com.campushire.entity.Application;
import com.campushire.entity.Job;
import com.campushire.entity.Student;
import com.campushire.enums.ApplicationStatus;
import com.campushire.enums.PlacementStatus;
import com.campushire.exception.BusinessConflictException;
import com.campushire.exception.ResourceNotFoundException;
import com.campushire.exception.ValidationException;
import com.campushire.repository.ApplicationRepository;
import com.campushire.repository.JobRepository;
import com.campushire.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final EligibilityService eligibilityService;

    @Autowired
    public ApplicationService(ApplicationRepository applicationRepository,
                              StudentRepository studentRepository,
                              JobRepository jobRepository,
                              EligibilityService eligibilityService) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.eligibilityService = eligibilityService;
    }

    public List<ApplicationResponseDTO> getAllApplications(Long studentId, Long jobId, String status) {
        ApplicationStatus appStatus = null;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            appStatus = ApplicationStatus.fromString(status);
        }

        List<Application> apps = applicationRepository.searchApplications(studentId, jobId, appStatus);
        return apps.stream()
                .map(ApplicationResponseDTO::new)
                .toList();
    }

    public ApplicationResponseDTO getApplicationById(Long id) {
        Application app = findEntityById(id);
        return new ApplicationResponseDTO(app);
    }

    public Application findEntityById(Long id) {
        return applicationRepository.findByIdWithDetails(id)
                .or(() -> applicationRepository.findById(id))
                .orElseThrow(() -> new ResourceNotFoundException("Application with ID " + id + " not found"));
    }

    @Transactional
    public ApplicationResponseDTO applyForJob(Long studentId, Long jobId) {
        // 1. Service Layer Duplicate Check
        if (applicationRepository.existsByStudentIdAndJobId(studentId, jobId)) {
            throw new BusinessConflictException("Student ID " + studentId + " has already submitted an application for Job ID " + jobId);
        }

        // 2. Eligibility Evaluation Check
        EligibilityResultDTO eligibility = eligibilityService.checkEligibility(jobId, studentId);
        if (!eligibility.isEligible()) {
            String reasonsStr = String.join(" ", eligibility.getReasons());
            throw new ValidationException("Student is not eligible for this job: " + reasonsStr);
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student with ID " + studentId + " not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job opening with ID " + jobId + " not found"));

        // 3. Create Application
        Application application = new Application(student, job, ApplicationStatus.APPLIED);
        Application saved = applicationRepository.save(application);

        return new ApplicationResponseDTO(saved);
    }

    @Transactional
    public ApplicationResponseDTO updateStatus(Long id, ApplicationStatus newStatus) {
        Application currentApp = findEntityById(id);

        if (currentApp.getStatus() == newStatus) {
            return new ApplicationResponseDTO(currentApp);
        }

        // Validate Status Transition Pipeline
        if (!currentApp.getStatus().isValidTransitionTo(newStatus)) {
            throw new ValidationException("Invalid status transition from " + currentApp.getStatus() + " to " + newStatus);
        }

        currentApp.setStatus(newStatus);

        // When application becomes SELECTED, synchronize student placement status to PLACED
        if (newStatus == ApplicationStatus.SELECTED) {
            Student student = currentApp.getStudent();
            student.setPlacementStatus(PlacementStatus.PLACED);
            studentRepository.save(student);
        }

        Application updated = applicationRepository.save(currentApp);
        return new ApplicationResponseDTO(updated);
    }

    @Transactional
    public void deleteApplication(Long id) {
        Application app = findEntityById(id);
        applicationRepository.delete(app);
    }
}
