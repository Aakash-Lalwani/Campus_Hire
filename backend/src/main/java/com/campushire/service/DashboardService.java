package com.campushire.service;

import com.campushire.dto.DashboardStatsDTO;
import com.campushire.enums.JobStatus;
import com.campushire.enums.PlacementStatus;
import com.campushire.repository.ApplicationRepository;
import com.campushire.repository.CompanyRepository;
import com.campushire.repository.JobRepository;
import com.campushire.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @Autowired
    public DashboardService(StudentRepository studentRepository,
                            CompanyRepository companyRepository,
                            JobRepository jobRepository,
                            ApplicationRepository applicationRepository) {
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
    }

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        long totalStudents = studentRepository.count();
        long totalCompanies = companyRepository.count();
        long openJobs = jobRepository.countByJobStatus(JobStatus.OPEN);
        long totalApplications = applicationRepository.count();
        long studentsPlaced = studentRepository.countByPlacementStatus(PlacementStatus.PLACED);

        stats.setTotalStudents(totalStudents);
        stats.setTotalCompanies(totalCompanies);
        stats.setOpenJobs(openJobs);
        stats.setTotalApplications(totalApplications);
        stats.setStudentsPlaced(studentsPlaced);

        if (totalStudents > 0) {
            double pct = ((double) studentsPlaced / totalStudents) * 100.0;
            stats.setPlacementPercentage(Math.round(pct * 100.0) / 100.0);
        } else {
            stats.setPlacementPercentage(0.0);
        }

        stats.setPlacementsByBranch(getPlacementsByBranch());
        stats.setApplicationsByCompany(getApplicationsByCompany());
        stats.setPackageDistribution(getPackageDistribution());

        return stats;
    }

    public List<Map<String, Object>> getPlacementsByBranch() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<StudentRepository.BranchPlacementProjection> projections = studentRepository.countPlacementsByBranch();
        for (StudentRepository.BranchPlacementProjection p : projections) {
            Map<String, Object> map = new HashMap<>();
            map.put("branch", p.getBranch());
            map.put("total", p.getTotal());
            map.put("placed", p.getPlaced());
            result.add(map);
        }
        return result;
    }

    public List<Map<String, Object>> getApplicationsByCompany() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<CompanyRepository.CompanyApplicationProjection> projections = companyRepository.countApplicationsByCompany();
        for (CompanyRepository.CompanyApplicationProjection p : projections) {
            Map<String, Object> map = new HashMap<>();
            map.put("company", p.getCompany());
            map.put("applications", p.getApplications());
            result.add(map);
        }
        return result;
    }

    public List<Map<String, Object>> getPackageDistribution() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<JobRepository.PackageDistributionProjection> projections = jobRepository.countPackageDistribution();
        for (JobRepository.PackageDistributionProjection p : projections) {
            Map<String, Object> map = new HashMap<>();
            map.put("label", p.getLabel());
            map.put("count", p.getCount());
            result.add(map);
        }
        return result;
    }
}
