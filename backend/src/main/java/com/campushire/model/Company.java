package com.campushire.model;

import java.sql.Timestamp;

public class Company {
    private Long id;
    private String name;
    private String industry;
    private String location;
    private String website;
    private String contactPerson;
    private String contactEmail;
    private Timestamp createdAt;

    public Company() {}

    public Company(Long id, String name, String industry, String location, String website, String contactPerson, String contactEmail, Timestamp createdAt) {
        this.id = id;
        this.name = name;
        this.industry = industry;
        this.location = location;
        this.website = website;
        this.contactPerson = contactPerson;
        this.contactEmail = contactEmail;
        this.createdAt = createdAt;
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

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
