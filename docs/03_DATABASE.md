# CampusHire — Database Design

Database: campushire

## Tables

### students
- id BIGINT PK AUTO_INCREMENT
- name VARCHAR(100) NOT NULL
- email VARCHAR(150) UNIQUE NOT NULL
- phone VARCHAR(20)
- branch VARCHAR(50) NOT NULL
- cgpa DECIMAL(3,2) NOT NULL
- graduation_year INT NOT NULL
- backlogs INT NOT NULL DEFAULT 0
- skills TEXT
- placement_status VARCHAR(30) NOT NULL DEFAULT 'NOT_PLACED'
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### companies
- id BIGINT PK AUTO_INCREMENT
- name VARCHAR(150) NOT NULL
- industry VARCHAR(100)
- location VARCHAR(150)
- website VARCHAR(255)
- contact_person VARCHAR(100)
- contact_email VARCHAR(150)
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### jobs
- id BIGINT PK AUTO_INCREMENT
- company_id BIGINT NOT NULL FK companies(id)
- role VARCHAR(150) NOT NULL
- description TEXT
- package_lpa DECIMAL(6,2) NOT NULL
- min_cgpa DECIMAL(3,2) NOT NULL
- allowed_branches VARCHAR(255) NOT NULL
- max_backlogs INT NOT NULL DEFAULT 0
- application_deadline DATE NOT NULL
- job_status VARCHAR(20) DEFAULT 'OPEN'
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### applications
- id BIGINT PK AUTO_INCREMENT
- student_id BIGINT NOT NULL FK students(id)
- job_id BIGINT NOT NULL FK jobs(id)
- status VARCHAR(30) NOT NULL DEFAULT 'APPLIED'
- applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- UNIQUE(student_id, job_id)

### interviews
- id BIGINT PK AUTO_INCREMENT
- application_id BIGINT NOT NULL FK applications(id)
- round VARCHAR(30) NOT NULL
- scheduled_at DATETIME NOT NULL
- mode VARCHAR(30) NOT NULL
- interviewer VARCHAR(100)
- result VARCHAR(20) DEFAULT 'PENDING'
- remarks TEXT

## Indexes
Create indexes for:
- students(branch)
- students(cgpa)
- jobs(company_id)
- jobs(job_status)
- applications(student_id)
- applications(job_id)
- interviews(application_id)

## Seed Data
Include realistic demo data:
- 12–20 students across CSE, IT, AI/ML, ECE.
- 5–8 companies.
- 8–12 jobs.
- 15–25 applications.
- 8–12 interviews.
- A mixture of eligible/ineligible students and selected/rejected applications.

Do not use real personal data.
