package com.campushire.dao;

import com.campushire.enums.PlacementStatus;
import com.campushire.model.Student;
import com.campushire.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class StudentDAO {

    public List<Student> findAll(String search, String branch, String status) throws SQLException {
        List<Student> students = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT * FROM students WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            sql.append("AND (LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?) OR LOWER(skills) LIKE LOWER(?)) ");
            String term = "%" + search.trim() + "%";
            params.add(term);
            params.add(term);
            params.add(term);
        }
        if (branch != null && !branch.isBlank() && !"ALL".equalsIgnoreCase(branch)) {
            sql.append("AND branch = ? ");
            params.add(branch.trim());
        }
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            sql.append("AND placement_status = ? ");
            params.add(status.trim());
        }

        sql.append("ORDER BY id DESC");

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    students.add(mapResultSetToStudent(rs));
                }
            }
        }
        return students;
    }

    public Optional<Student> findById(Long id) throws SQLException {
        String sql = "SELECT * FROM students WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToStudent(rs));
                }
            }
        }
        return Optional.empty();
    }

    public Optional<Student> findByEmail(String email) throws SQLException {
        String sql = "SELECT * FROM students WHERE email = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToStudent(rs));
                }
            }
        }
        return Optional.empty();
    }

    public Student create(Student student) throws SQLException {
        String sql = "INSERT INTO students (name, email, phone, branch, cgpa, graduation_year, backlogs, skills, placement_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, student.getName());
            stmt.setString(2, student.getEmail());
            stmt.setString(3, student.getPhone());
            stmt.setString(4, student.getBranch());
            stmt.setDouble(5, student.getCgpa());
            stmt.setInt(6, student.getGraduationYear());
            stmt.setInt(7, student.getBacklogs() != null ? student.getBacklogs() : 0);
            stmt.setString(8, student.getSkills());
            stmt.setString(9, student.getPlacementStatus() != null ? student.getPlacementStatus().name() : PlacementStatus.NOT_PLACED.name());

            stmt.executeUpdate();

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    student.setId(generatedKeys.getLong(1));
                }
            }
        }
        return student;
    }

    public boolean update(Student student) throws SQLException {
        String sql = "UPDATE students SET name=?, email=?, phone=?, branch=?, cgpa=?, graduation_year=?, backlogs=?, skills=?, placement_status=? WHERE id=?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, student.getName());
            stmt.setString(2, student.getEmail());
            stmt.setString(3, student.getPhone());
            stmt.setString(4, student.getBranch());
            stmt.setDouble(5, student.getCgpa());
            stmt.setInt(6, student.getGraduationYear());
            stmt.setInt(7, student.getBacklogs());
            stmt.setString(8, student.getSkills());
            stmt.setString(9, student.getPlacementStatus().name());
            stmt.setLong(10, student.getId());

            return stmt.executeUpdate() > 0;
        }
    }

    public boolean updatePlacementStatus(Long studentId, PlacementStatus status) throws SQLException {
        String sql = "UPDATE students SET placement_status = ? WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status.name());
            stmt.setLong(2, studentId);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean delete(Long id) throws SQLException {
        String sql = "DELETE FROM students WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        }
    }

    private Student mapResultSetToStudent(ResultSet rs) throws SQLException {
        Student s = new Student();
        s.setId(rs.getLong("id"));
        s.setName(rs.getString("name"));
        s.setEmail(rs.getString("email"));
        s.setPhone(rs.getString("phone"));
        s.setBranch(rs.getString("branch"));
        s.setCgpa(rs.getDouble("cgpa"));
        s.setGraduationYear(rs.getInt("graduation_year"));
        s.setBacklogs(rs.getInt("backlogs"));
        s.setSkills(rs.getString("skills"));
        s.setPlacementStatus(PlacementStatus.fromString(rs.getString("placement_status")));
        s.setCreatedAt(rs.getTimestamp("created_at"));
        return s;
    }
}
