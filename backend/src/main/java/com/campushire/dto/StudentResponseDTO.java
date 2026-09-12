package com.campushire.dto;

import com.campushire.entity.Student;
import com.campushire.enums.PlacementStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class StudentResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String branch;
    private Double cgpa;
    private Integer graduationYear;
    private Integer backlogs;
    private String skills;
    private PlacementStatus placementStatus;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    public StudentResponseDTO() {}

    public StudentResponseDTO(Student s) {
        if (s != null) {
            this.id = s.getId();
            this.name = s.getName();
            this.email = s.getEmail();
            this.phone = s.getPhone();
            this.branch = s.getBranch();
            this.cgpa = s.getCgpa();
            this.graduationYear = s.getGraduationYear();
            this.backlogs = s.getBacklogs();
            this.skills = s.getSkills();
            this.placementStatus = s.getPlacementStatus();
            this.createdAt = s.getCreatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public Integer getBacklogs() { return backlogs; }
    public void setBacklogs(Integer backlogs) { this.backlogs = backlogs; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public PlacementStatus getPlacementStatus() { return placementStatus; }
    public void setPlacementStatus(PlacementStatus placementStatus) { this.placementStatus = placementStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
