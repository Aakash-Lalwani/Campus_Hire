package com.campushire.dao;

import com.campushire.enums.InterviewResult;
import com.campushire.enums.InterviewRound;
import com.campushire.model.Interview;
import com.campushire.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class InterviewDAO {

    public List<Interview> findAll(Long applicationId, String result) throws SQLException {
        List<Interview> interviews = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
            "SELECT i.*, s.name AS student_name, c.name AS company_name, j.role AS job_role " +
            "FROM interviews i " +
            "JOIN applications a ON i.application_id = a.id " +
            "JOIN students s ON a.student_id = s.id " +
            "JOIN jobs j ON a.job_id = j.id " +
            "JOIN companies c ON j.company_id = c.id WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (applicationId != null && applicationId > 0) {
            sql.append("AND i.application_id = ? ");
            params.add(applicationId);
        }
        if (result != null && !result.isBlank() && !"ALL".equalsIgnoreCase(result)) {
            sql.append("AND i.result = ? ");
            params.add(result.trim());
        }

        sql.append("ORDER BY i.scheduled_at DESC");

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    interviews.add(mapResultSetToInterview(rs));
                }
            }
        }
        return interviews;
    }

    public Optional<Interview> findById(Long id) throws SQLException {
        String sql = "SELECT i.*, s.name AS student_name, c.name AS company_name, j.role AS job_role " +
                     "FROM interviews i " +
                     "JOIN applications a ON i.application_id = a.id " +
                     "JOIN students s ON a.student_id = s.id " +
                     "JOIN jobs j ON a.job_id = j.id " +
                     "JOIN companies c ON j.company_id = c.id WHERE i.id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToInterview(rs));
                }
            }
        }
        return Optional.empty();
    }

    public Interview create(Interview interview) throws SQLException {
        String sql = "INSERT INTO interviews (application_id, round, scheduled_at, mode, interviewer, result, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setLong(1, interview.getApplicationId());
            stmt.setString(2, interview.getRound().name());
            stmt.setTimestamp(3, interview.getScheduledAt());
            stmt.setString(4, interview.getMode());
            stmt.setString(5, interview.getInterviewer());
            stmt.setString(6, interview.getResult() != null ? interview.getResult().name() : InterviewResult.PENDING.name());
            stmt.setString(7, interview.getRemarks());

            stmt.executeUpdate();

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    interview.setId(generatedKeys.getLong(1));
                }
            }
        }
        return interview;
    }

    public boolean update(Interview interview) throws SQLException {
        String sql = "UPDATE interviews SET round=?, scheduled_at=?, mode=?, interviewer=?, result=?, remarks=? WHERE id=?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, interview.getRound().name());
            stmt.setTimestamp(2, interview.getScheduledAt());
            stmt.setString(3, interview.getMode());
            stmt.setString(4, interview.getInterviewer());
            stmt.setString(5, interview.getResult().name());
            stmt.setString(6, interview.getRemarks());
            stmt.setLong(7, interview.getId());

            return stmt.executeUpdate() > 0;
        }
    }

    public boolean delete(Long id) throws SQLException {
        String sql = "DELETE FROM interviews WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        }
    }

    private Interview mapResultSetToInterview(ResultSet rs) throws SQLException {
        Interview i = new Interview();
        i.setId(rs.getLong("id"));
        i.setApplicationId(rs.getLong("application_id"));
        i.setStudentName(rs.getString("student_name"));
        i.setCompanyName(rs.getString("company_name"));
        i.setJobRole(rs.getString("job_role"));
        i.setRound(InterviewRound.fromString(rs.getString("round")));
        i.setScheduledAt(rs.getTimestamp("scheduled_at"));
        i.setMode(rs.getString("mode"));
        i.setInterviewer(rs.getString("interviewer"));
        i.setResult(InterviewResult.fromString(rs.getString("result")));
        i.setRemarks(rs.getString("remarks"));
        return i;
    }
}
