package com.campushire.dto;

import com.campushire.entity.Company;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class CompanyResponseDTO {
    private Long id;
    private String name;
    private String industry;
    private String location;
    private String website;
    private String contactPerson;
    private String contactEmail;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    public CompanyResponseDTO() {}

    public CompanyResponseDTO(Company c) {
        if (c != null) {
            this.id = c.getId();
            this.name = c.getName();
            this.industry = c.getIndustry();
            this.location = c.getLocation();
            this.website = c.getWebsite();
            this.contactPerson = c.getContactPerson();
            this.contactEmail = c.getContactEmail();
            this.createdAt = c.getCreatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
