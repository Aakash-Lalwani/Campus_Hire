# CampusHire — Product Requirements Document

## 1. Product
CampusHire is a professional full-stack campus placement management system for colleges. It manages students, companies, job openings, eligibility, applications, interviews, selection status, and placement analytics.

## 2. Primary Goal
Build a realistic 4th-year B.Tech-level Java + React project that is easy to demonstrate and explain in a Cognizant Java FSE interview.

## 3. Technology Constraints
Frontend:
- React + Vite
- JavaScript
- React Router
- Axios
- Recharts
- CSS (clean responsive UI)

Backend:
- Java 17+
- Maven
- Jakarta Servlet API
- Apache Tomcat 10+
- JDBC
- MySQL 8+

Explicitly DO NOT use:
- Spring Boot
- Spring Security
- JWT
- OAuth
- Microservices
- Docker/Kubernetes
- Kafka/Redis
- JUnit as a project requirement
- AI/ML features

Authentication/authorization is out of scope. Use a simple role selector/demo mode if needed.

## 4. Users
1. Placement Officer
2. Student
3. Recruiter/Company representative

For the MVP, role-based UI can be represented by a simple demo-role selector without implementing real security.

## 5. Core Features
### Student Management
- Add, edit, delete, search and filter students.
- Fields: id, name, email, phone, branch, cgpa, graduationYear, backlogs, skills, placementStatus.
- Placement statuses: NOT_PLACED, PLACED, HIGHER_STUDIES.

### Company Management
- CRUD companies.
- Fields: id, name, industry, location, website, contactPerson, contactEmail.

### Job Management
- Create/update/delete job openings.
- Fields: id, companyId, role, description, packageLpa, minCgpa, allowedBranches, maxBacklogs, applicationDeadline, jobStatus.
- Job statuses: OPEN, CLOSED.

### Eligibility Engine
A student is eligible when:
- CGPA >= minimum CGPA
- branch is included in allowed branches
- backlogs <= maximum allowed backlogs
- job is OPEN
- current date is before/equal to application deadline

Return eligibility plus human-readable reasons for rejection.

### Applications
- Apply for a job.
- Prevent duplicate applications.
- Show applications by student/job.
- Status pipeline:
  APPLIED -> SHORTLISTED -> APTITUDE -> TECHNICAL -> HR -> SELECTED/REJECTED

### Interviews
- Schedule interview rounds.
- Fields: applicationId, round, scheduledDateTime, mode, interviewer, result, remarks.
- Result: PENDING, PASSED, FAILED.

### Dashboard
Display:
- Total students
- Total companies
- Open jobs
- Total applications
- Students placed
- Placement percentage
- Applications by company
- Placements by branch
- Package distribution
- Recent interviews

## 6. Non-Functional Requirements
- Clean layered architecture.
- Consistent REST-style JSON APIs.
- Server-side validation.
- Centralized exception handling.
- PreparedStatement for SQL.
- No SQL string concatenation using user input.
- Responsive UI.
- Loading, empty and error states.
- Confirmation before destructive actions.
- Seed/demo data for immediate demonstration.
- README with exact setup instructions.

## 7. Success Criteria
A fresh clone should be runnable locally with:
1. MySQL database created.
2. Schema and seed script executed.
3. Maven backend started on port 8080.
4. React frontend started on port 5173.
5. Dashboard loads.
6. CRUD operations work.
7. Eligibility works.
8. Application flow works.
9. Interview flow works.
10. Dashboard metrics update from database data.
