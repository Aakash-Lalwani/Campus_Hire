package com.campushire.dao;

import com.campushire.enums.ApplicationStatus;
import com.campushire.model.Application;
import com.campushire.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ApplicationDAO {

    public List<Application> findAll(Long studentId, Long jobId, String status) throws SQLException {
        List<Application> apps = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
            "SELECT a.*, s.name AS student_name, s.branch AS student_branch, s.cgpa AS student_cgpa, " +
            "j.role AS job_role, c.name AS company_name " +
            "FROM applications a " +
            "JOIN students s ON a.student_id = s.id " +
            "JOIN jobs j ON a.job_id = j.id " +
            "JOIN companies c ON j.company_id = c.id WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (studentId != null && studentId > 0) {
            sql.append("AND a.student_id = ? ");
            params.add(studentId);
        }
        if (jobId != null && jobId > 0) {
            sql.append("AND a.job_id = ? ");
            params.add(jobId);
        }
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            sql.append("AND a.status = ? ");
            params.add(status.trim());
        }

        sql.append("ORDER BY a.id DESC");

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    apps.add(mapResultSetToApplication(rs));
                }
            }
        }
        return apps;
    }

    public Optional<Application> findById(Long id) throws SQLException {
        String sql = "SELECT a.*, s.name AS student_name, s.branch AS student_branch, s.cgpa AS student_cgpa, " +
                     "j.role AS job_role, c.name AS company_name " +
                     "FROM applications a " +
                     "JOIN students s ON a.student_id = s.id " +
                     "JOIN jobs j ON a.job_id = j.id " +
                     "JOIN companies c ON j.company_id = c.id WHERE a.id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToApplication(rs));
                }
            }
        }
        return Optional.empty();
    }

    public boolean existsByStudentIdAndJobId(Long studentId, Long jobId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM applications WHERE student_id = ? AND job_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, studentId);
            stmt.setLong(2, jobId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        }
        return false;
    }

    public Application create(Application application) throws SQLException {
        String sql = "INSERT INTO applications (student_id, job_id, status) VALUES (?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setLong(1, application.getStudentId());
            stmt.setLong(2, application.getJobId());
            stmt.setString(3, application.getStatus() != null ? application.getStatus().name() : ApplicationStatus.APPLIED.name());

            stmt.executeUpdate();

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    application.setId(generatedKeys.getLong(1));
                }
            }
        }
        return application;
    }

    public boolean updateStatus(Long id, ApplicationStatus status) throws SQLException {
        String sql = "UPDATE applications SET status = ? WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status.name());
            stmt.setLong(2, id);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean delete(Long id) throws SQLException {
        String sql = "DELETE FROM applications WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        }
    }

    private Application mapResultSetToApplication(ResultSet rs) throws SQLException {
        Application a = new Application();
        a.setId(rs.getLong("id"));
        a.setStudentId(rs.getLong("student_id"));
        a.setStudentName(rs.getString("student_name"));
        a.setStudentBranch(rs.getString("student_branch"));
        a.setStudentCgpa(rs.getDouble("student_cgpa"));
        a.setJobId(rs.getLong("job_id"));
        a.setJobRole(rs.getString("job_role"));
        a.setCompanyName(rs.getString("company_name"));
        a.setStatus(ApplicationStatus.fromString(rs.getString("status")));
        a.setAppliedAt(rs.getTimestamp("applied_at"));
        return a;
    }
}
