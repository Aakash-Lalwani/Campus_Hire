package com.campushire.service;

import com.campushire.dao.CompanyDAO;
import com.campushire.dao.JobDAO;
import com.campushire.exception.ResourceNotFoundException;
import com.campushire.exception.ValidationException;
import com.campushire.model.Job;

import java.sql.SQLException;
import java.util.List;

public class JobService {
    private final JobDAO jobDAO = new JobDAO();
    private final CompanyDAO companyDAO = new CompanyDAO();

    public List<Job> getAllJobs(String search, Long companyId, String status) throws SQLException {
        return jobDAO.findAll(search, companyId, status);
    }

    public Job getJobById(Long id) throws SQLException {
        return jobDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job opening with ID " + id + " not found"));
    }

    public Job createJob(Job job) throws SQLException {
        validateJob(job);
        // Verify company exists
        companyDAO.findById(job.getCompanyId())
                .orElseThrow(() -> new ValidationException("Invalid company ID: Company does not exist"));
        return jobDAO.create(job);
    }

    public Job updateJob(Long id, Job job) throws SQLException {
        getJobById(id);
        job.setId(id);
        validateJob(job);
        companyDAO.findById(job.getCompanyId())
                .orElseThrow(() -> new ValidationException("Invalid company ID: Company does not exist"));
        jobDAO.update(job);
        return getJobById(id);
    }

    public void deleteJob(Long id) throws SQLException {
        getJobById(id);
        jobDAO.delete(id);
    }

    private void validateJob(Job j) {
        if (j.getCompanyId() == null || j.getCompanyId() <= 0) {
            throw new ValidationException("Company ID is required");
        }
        if (j.getRole() == null || j.getRole().isBlank()) {
            throw new ValidationException("Job role title is required");
        }
        if (j.getPackageLpa() == null || j.getPackageLpa() <= 0) {
            throw new ValidationException("Package (LPA) must be greater than 0");
        }
        if (j.getMinCgpa() == null || j.getMinCgpa() < 0.0 || j.getMinCgpa() > 10.0) {
            throw new ValidationException("Minimum CGPA must be between 0.0 and 10.0");
        }
        if (j.getAllowedBranches() == null || j.getAllowedBranches().isBlank()) {
            throw new ValidationException("Allowed branches must be specified");
        }
        if (j.getMaxBacklogs() == null || j.getMaxBacklogs() < 0) {
            throw new ValidationException("Max backlogs cannot be negative");
        }
        if (j.getApplicationDeadline() == null) {
            throw new ValidationException("Application deadline date is required");
        }
    }
}
