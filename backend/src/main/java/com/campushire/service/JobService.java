package com.campushire.service;

import com.campushire.dto.JobRequestDTO;
import com.campushire.dto.JobResponseDTO;
import com.campushire.entity.Company;
import com.campushire.entity.Job;
import com.campushire.enums.JobStatus;
import com.campushire.exception.ResourceNotFoundException;
import com.campushire.exception.ValidationException;
import com.campushire.repository.CompanyRepository;
import com.campushire.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;

    @Autowired
    public JobService(JobRepository jobRepository, CompanyRepository companyRepository) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
    }

    public List<JobResponseDTO> getAllJobs(String search, Long companyId, String status) {
        JobStatus jobStatus = null;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            jobStatus = JobStatus.fromString(status);
        }

        List<Job> jobs = jobRepository.searchJobs(search, companyId, jobStatus);
        return jobs.stream()
                .map(JobResponseDTO::new)
                .toList();
    }

    public JobResponseDTO getJobById(Long id) {
        Job job = findEntityById(id);
        return new JobResponseDTO(job);
    }

    public Job findEntityById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job opening with ID " + id + " not found"));
    }

    @Transactional
    public JobResponseDTO createJob(JobRequestDTO dto) {
        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new ValidationException("Invalid company ID: Company does not exist"));

        Job job = new Job();
        job.setCompany(company);
        job.setRole(dto.getRole());
        job.setDescription(dto.getDescription());
        job.setPackageLpa(dto.getPackageLpa());
        job.setMinCgpa(dto.getMinCgpa());
        job.setAllowedBranches(dto.getAllowedBranches());
        job.setMaxBacklogs(dto.getMaxBacklogs() != null ? dto.getMaxBacklogs() : 0);
        job.setApplicationDeadline(dto.getApplicationDeadline());
        job.setJobStatus(dto.getJobStatus() != null ? dto.getJobStatus() : JobStatus.OPEN);

        Job saved = jobRepository.save(job);
        return new JobResponseDTO(saved);
    }

    @Transactional
    public JobResponseDTO updateJob(Long id, JobRequestDTO dto) {
        Job job = findEntityById(id);

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new ValidationException("Invalid company ID: Company does not exist"));

        job.setCompany(company);
        job.setRole(dto.getRole());
        job.setDescription(dto.getDescription());
        job.setPackageLpa(dto.getPackageLpa());
        job.setMinCgpa(dto.getMinCgpa());
        job.setAllowedBranches(dto.getAllowedBranches());
        job.setMaxBacklogs(dto.getMaxBacklogs() != null ? dto.getMaxBacklogs() : 0);
        job.setApplicationDeadline(dto.getApplicationDeadline());
        if (dto.getJobStatus() != null) {
            job.setJobStatus(dto.getJobStatus());
        }

        Job updated = jobRepository.save(job);
        return new JobResponseDTO(updated);
    }

    @Transactional
    public void deleteJob(Long id) {
        Job job = findEntityById(id);
        jobRepository.delete(job);
    }
}
