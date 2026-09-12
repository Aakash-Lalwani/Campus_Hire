-- CampusHire Placement Management System
-- Schema Definition for MySQL 8+

CREATE DATABASE IF NOT EXISTS campushire;
USE campushire;

-- Drop tables in reverse dependency order for clean recreation if re-run
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS students;

-- 1. Students Table
CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    branch VARCHAR(50) NOT NULL,
    cgpa DECIMAL(3,2) NOT NULL,
    graduation_year INT NOT NULL,
    backlogs INT NOT NULL DEFAULT 0,
    skills TEXT,
    placement_status VARCHAR(30) NOT NULL DEFAULT 'NOT_PLACED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Companies Table
CREATE TABLE companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    location VARCHAR(150),
    website VARCHAR(255),
    contact_person VARCHAR(100),
    contact_email VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Jobs Table
CREATE TABLE jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    role VARCHAR(150) NOT NULL,
    description TEXT,
    package_lpa DECIMAL(6,2) NOT NULL,
    min_cgpa DECIMAL(3,2) NOT NULL,
    allowed_branches VARCHAR(255) NOT NULL,
    max_backlogs INT NOT NULL DEFAULT 0,
    application_deadline DATE NOT NULL,
    job_status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 4. Applications Table
CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'APPLIED',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT uq_student_job UNIQUE (student_id, job_id)
);

-- 5. Interviews Table
CREATE TABLE interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    round VARCHAR(30) NOT NULL,
    scheduled_at DATETIME NOT NULL,
    mode VARCHAR(30) NOT NULL,
    interviewer VARCHAR(100),
    result VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    remarks TEXT,
    CONSTRAINT fk_int_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX idx_students_branch ON students(branch);
CREATE INDEX idx_students_cgpa ON students(cgpa);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(job_status);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_interviews_application ON interviews(application_id);
