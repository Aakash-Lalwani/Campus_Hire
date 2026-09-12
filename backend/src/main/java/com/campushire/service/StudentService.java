package com.campushire.service;

import com.campushire.dao.StudentDAO;
import com.campushire.exception.BusinessConflictException;
import com.campushire.exception.ResourceNotFoundException;
import com.campushire.exception.ValidationException;
import com.campushire.model.Student;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class StudentService {
    private final StudentDAO studentDAO = new StudentDAO();

    public List<Student> getAllStudents(String search, String branch, String status) throws SQLException {
        return studentDAO.findAll(search, branch, status);
    }

    public Student getStudentById(Long id) throws SQLException {
        return studentDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student with ID " + id + " not found"));
    }

    public Student createStudent(Student student) throws SQLException {
        validateStudent(student);

        Optional<Student> existing = studentDAO.findByEmail(student.getEmail());
        if (existing.isPresent()) {
            throw new BusinessConflictException("Student with email '" + student.getEmail() + "' already exists", "DUPLICATE_EMAIL");
        }

        return studentDAO.create(student);
    }

    public Student updateStudent(Long id, Student student) throws SQLException {
        getStudentById(id); // Ensures student exists
        student.setId(id);
        validateStudent(student);

        Optional<Student> existing = studentDAO.findByEmail(student.getEmail());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new BusinessConflictException("Student with email '" + student.getEmail() + "' already exists", "DUPLICATE_EMAIL");
        }

        studentDAO.update(student);
        return student;
    }

    public void deleteStudent(Long id) throws SQLException {
        getStudentById(id);
        studentDAO.delete(id);
    }

    private void validateStudent(Student s) {
        if (s.getName() == null || s.getName().isBlank()) {
            throw new ValidationException("Student name is required");
        }
        if (s.getEmail() == null || s.getEmail().isBlank() || !s.getEmail().contains("@")) {
            throw new ValidationException("Valid email address is required");
        }
        if (s.getBranch() == null || s.getBranch().isBlank()) {
            throw new ValidationException("Branch is required");
        }
        if (s.getCgpa() == null || s.getCgpa() < 0.0 || s.getCgpa() > 10.0) {
            throw new ValidationException("CGPA must be between 0.0 and 10.0");
        }
        if (s.getGraduationYear() == null || s.getGraduationYear() < 2020) {
            throw new ValidationException("Valid graduation year is required");
        }
        if (s.getBacklogs() == null || s.getBacklogs() < 0) {
            throw new ValidationException("Backlogs cannot be negative");
        }
    }
}
