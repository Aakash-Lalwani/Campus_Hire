package com.campushire.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDTO {
    private long totalStudents;
    private long totalCompanies;
    private long openJobs;
    private long totalApplications;
    private long studentsPlaced;
    private double placementPercentage;
    private List<Map<String, Object>> placementsByBranch;
    private List<Map<String, Object>> applicationsByCompany;
    private List<Map<String, Object>> packageDistribution;

    public DashboardStatsDTO() {}

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalCompanies() { return totalCompanies; }
    public void setTotalCompanies(long totalCompanies) { this.totalCompanies = totalCompanies; }

    public long getOpenJobs() { return openJobs; }
    public void setOpenJobs(long openJobs) { this.openJobs = openJobs; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getStudentsPlaced() { return studentsPlaced; }
    public void setStudentsPlaced(long studentsPlaced) { this.studentsPlaced = studentsPlaced; }

    public double getPlacementPercentage() { return placementPercentage; }
    public void setPlacementPercentage(double placementPercentage) { this.placementPercentage = placementPercentage; }

    public List<Map<String, Object>> getPlacementsByBranch() { return placementsByBranch; }
    public void setPlacementsByBranch(List<Map<String, Object>> placementsByBranch) { this.placementsByBranch = placementsByBranch; }

    public List<Map<String, Object>> getApplicationsByCompany() { return applicationsByCompany; }
    public void setApplicationsByCompany(List<Map<String, Object>> applicationsByCompany) { this.applicationsByCompany = applicationsByCompany; }

    public List<Map<String, Object>> getPackageDistribution() { return packageDistribution; }
    public void setPackageDistribution(List<Map<String, Object>> packageDistribution) { this.packageDistribution = packageDistribution; }
}
