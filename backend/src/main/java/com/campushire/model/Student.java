package com.campushire.model;

import com.campushire.enums.PlacementStatus;
import java.sql.Timestamp;

public class Student {
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
    private Timestamp createdAt;

    public Student() {}

    public Student(Long id, String name, String email, String phone, String branch, Double cgpa, Integer graduationYear, Integer backlogs, String skills, PlacementStatus placementStatus, Timestamp createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.branch = branch;
        this.cgpa = cgpa;
        this.graduationYear = graduationYear;
        this.backlogs = backlogs;
        this.skills = skills;
        this.placementStatus = placementStatus;
        this.createdAt = createdAt;
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

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
