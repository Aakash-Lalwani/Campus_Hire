package com.campushire.dao;

import com.campushire.enums.JobStatus;
import com.campushire.model.Job;
import com.campushire.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class JobDAO {

    public List<Job> findAll(String search, Long companyId, String status) throws SQLException {
        List<Job> jobs = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
            "SELECT j.*, c.name AS company_name FROM jobs j " +
            "JOIN companies c ON j.company_id = c.id WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            sql.append("AND (LOWER(j.role) LIKE LOWER(?) OR LOWER(c.name) LIKE LOWER(?) OR LOWER(j.allowed_branches) LIKE LOWER(?)) ");
            String term = "%" + search.trim() + "%";
            params.add(term);
            params.add(term);
            params.add(term);
        }
        if (companyId != null && companyId > 0) {
            sql.append("AND j.company_id = ? ");
            params.add(companyId);
        }
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            sql.append("AND j.job_status = ? ");
            params.add(status.trim());
        }

        sql.append("ORDER BY j.id DESC");

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    jobs.add(mapResultSetToJob(rs));
                }
            }
        }
        return jobs;
    }

    public Optional<Job> findById(Long id) throws SQLException {
        String sql = "SELECT j.*, c.name AS company_name FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToJob(rs));
                }
            }
        }
        return Optional.empty();
    }

    public Job create(Job job) throws SQLException {
        String sql = "INSERT INTO jobs (company_id, role, description, package_lpa, min_cgpa, allowed_branches, max_backlogs, application_deadline, job_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setLong(1, job.getCompanyId());
            stmt.setString(2, job.getRole());
            stmt.setString(3, job.getDescription());
            stmt.setDouble(4, job.getPackageLpa());
            stmt.setDouble(5, job.getMinCgpa());
            stmt.setString(6, job.getAllowedBranches());
            stmt.setInt(7, job.getMaxBacklogs() != null ? job.getMaxBacklogs() : 0);
            stmt.setDate(8, job.getApplicationDeadline());
            stmt.setString(9, job.getJobStatus() != null ? job.getJobStatus().name() : JobStatus.OPEN.name());

            stmt.executeUpdate();

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    job.setId(generatedKeys.getLong(1));
                }
            }
        }
        return job;
    }

    public boolean update(Job job) throws SQLException {
        String sql = "UPDATE jobs SET company_id=?, role=?, description=?, package_lpa=?, min_cgpa=?, allowed_branches=?, max_backlogs=?, application_deadline=?, job_status=? WHERE id=?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setLong(1, job.getCompanyId());
            stmt.setString(2, job.getRole());
            stmt.setString(3, job.getDescription());
            stmt.setDouble(4, job.getPackageLpa());
            stmt.setDouble(5, job.getMinCgpa());
            stmt.setString(6, job.getAllowedBranches());
            stmt.setInt(7, job.getMaxBacklogs());
            stmt.setDate(8, job.getApplicationDeadline());
            stmt.setString(9, job.getJobStatus().name());
            stmt.setLong(10, job.getId());

            return stmt.executeUpdate() > 0;
        }
    }

    public boolean delete(Long id) throws SQLException {
        String sql = "DELETE FROM jobs WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        }
    }

    private Job mapResultSetToJob(ResultSet rs) throws SQLException {
        Job j = new Job();
        j.setId(rs.getLong("id"));
        j.setCompanyId(rs.getLong("company_id"));
        j.setCompanyName(rs.getString("company_name"));
        j.setRole(rs.getString("role"));
        j.setDescription(rs.getString("description"));
        j.setPackageLpa(rs.getDouble("package_lpa"));
        j.setMinCgpa(rs.getDouble("min_cgpa"));
        j.setAllowedBranches(rs.getString("allowed_branches"));
        j.setMaxBacklogs(rs.getInt("max_backlogs"));
        j.setApplicationDeadline(rs.getDate("application_deadline"));
        j.setJobStatus(JobStatus.fromString(rs.getString("job_status")));
        j.setCreatedAt(rs.getTimestamp("created_at"));
        return j;
    }
}
