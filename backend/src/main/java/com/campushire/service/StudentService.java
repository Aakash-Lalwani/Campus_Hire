package com.campushire.service;

import com.campushire.dto.StudentRequestDTO;
import com.campushire.dto.StudentResponseDTO;
import com.campushire.entity.Student;
import com.campushire.enums.PlacementStatus;
import com.campushire.exception.BusinessConflictException;
import com.campushire.exception.ResourceNotFoundException;
import com.campushire.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class StudentService {

    private final StudentRepository studentRepository;

    @Autowired
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<StudentResponseDTO> getAllStudents(String search, String branch, String status) {
        PlacementStatus placementStatus = null;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            placementStatus = PlacementStatus.fromString(status);
        }

        List<Student> students = studentRepository.searchStudents(search, branch, placementStatus);
        return students.stream()
                .map(StudentResponseDTO::new)
                .toList();
    }

    public StudentResponseDTO getStudentById(Long id) {
        Student student = findEntityById(id);
        return new StudentResponseDTO(student);
    }

    public Student findEntityById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student with ID " + id + " not found"));
    }

    @Transactional
    public StudentResponseDTO createStudent(StudentRequestDTO dto) {
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessConflictException("Student with email '" + dto.getEmail() + "' already exists", "DUPLICATE_EMAIL");
        }

        Student student = new Student(
                null,
                dto.getName(),
                dto.getEmail(),
                dto.getPhone(),
                dto.getBranch(),
                dto.getCgpa(),
                dto.getGraduationYear(),
                dto.getBacklogs(),
                dto.getSkills(),
                dto.getPlacementStatus() != null ? dto.getPlacementStatus() : PlacementStatus.NOT_PLACED
        );

        Student saved = studentRepository.save(student);
        return new StudentResponseDTO(saved);
    }

    @Transactional
    public StudentResponseDTO updateStudent(Long id, StudentRequestDTO dto) {
        Student student = findEntityById(id);

        if (!student.getEmail().equalsIgnoreCase(dto.getEmail()) && studentRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessConflictException("Student with email '" + dto.getEmail() + "' already exists", "DUPLICATE_EMAIL");
        }

        student.setName(dto.getName());
        student.setEmail(dto.getEmail());
        student.setPhone(dto.getPhone());
        student.setBranch(dto.getBranch());
        student.setCgpa(dto.getCgpa());
        student.setGraduationYear(dto.getGraduationYear());
        student.setBacklogs(dto.getBacklogs());
        student.setSkills(dto.getSkills());
        if (dto.getPlacementStatus() != null) {
            student.setPlacementStatus(dto.getPlacementStatus());
        }

        Student updated = studentRepository.save(student);
        return new StudentResponseDTO(updated);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = findEntityById(id);
        studentRepository.delete(student);
    }

    @Transactional
    public void updatePlacementStatus(Long studentId, PlacementStatus status) {
        Student student = findEntityById(studentId);
        student.setPlacementStatus(status);
        studentRepository.save(student);
    }
}
