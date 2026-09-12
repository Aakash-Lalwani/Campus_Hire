# CampusHire — Cognizant Java FSE Interview Question & Answer Guide

This document contains concise, technically precise interview responses tailored for a Cognizant Java Full Stack Engineer (FSE) technical interview.

---

## 1. Architecture & Design Questions

### Q1: Why did you choose Java Servlets + JDBC instead of Spring Boot or Hibernate?
**Answer**: "Building CampusHire with Jakarta Servlets and raw JDBC allowed me to demonstrate a foundational understanding of Java web technology under the hood. It showcases how HTTP request lifecycles, manual JSON serialization, layered architecture (Servlet → Service → DAO), and JDBC database transaction management work without relying on Spring Boot auto-configuration abstractions."

### Q2: Explain the responsibilities of your Servlet, Service, and DAO layers.
**Answer**:
- **Servlet Layer (`com.campushire.servlet`)**: Handles the HTTP boundary only—extracting request parameters/JSON bodies, checking HTTP method verb semantics, calling the service, and returning structured JSON responses. Servlets contain no business logic or SQL.
- **Service Layer (`com.campushire.service`)**: Contains all business domain rules—such as academic eligibility validation, duplicate application prevention, application pipeline transitions, and placement status updates.
- **DAO Layer (`com.campushire.dao`)**: Manages database access using JDBC `PreparedStatement` queries and maps SQL `ResultSet` rows to domain model POJOs.

---

## 2. Core Java & JDBC

### Q3: How do you prevent SQL Injection in CampusHire?
**Answer**: "Every database operation involving dynamic parameters uses JDBC `PreparedStatement` with parameterized placeholders (`?`). PreparedStatement pre-compiles the SQL query structure on the database server, treating user inputs strictly as literal data values rather than executable code instructions."

### Q4: How is database connection and resource closing managed?
**Answer**: "We utilize `DBUtil.getConnection()` wrapped inside Java `try-with-resources` blocks. Since `Connection`, `PreparedStatement`, and `ResultSet` implement `AutoCloseable`, try-with-resources guarantees that database sockets and statement handles are automatically closed even if an exception is thrown."

### Q5: How are custom exceptions used in CampusHire?
**Answer**: "We built a hierarchy extending `CampusHireException` (a runtime exception) with domain-specific exceptions:
- `ResourceNotFoundException` (HTTP 404)
- `ValidationException` (HTTP 400)
- `BusinessConflictException` (HTTP 409)

Servlets catch these exceptions and convert them into standardized JSON error responses containing human-readable error messages and error codes."

---

## 3. Business Logic & Feature Highlights

### Q6: How does the Eligibility Engine work?
**Answer**: "`EligibilityService.java` evaluates five criteria against student and job properties:
1. `jobStatus == OPEN`
2. `currentDate <= applicationDeadline`
3. `student.cgpa >= job.minCgpa`
4. `job.allowedBranches` contains `student.branch`
5. `student.backlogs <= job.maxBacklogs`

If ineligible, it returns a structured `EligibilityResultDTO` listing specific rejection reasons (e.g. branch mismatch or CGPA cutoff failure)."

### Q7: How is duplicate application prevention enforced?
**Answer**: "Duplicate prevention is enforced at two distinct layers:
1. **Service Layer**: `ApplicationService` calls `ApplicationDAO.existsByStudentIdAndJobId()` prior to insertion, throwing a `BusinessConflictException` (HTTP 409).
2. **Database Layer**: A `UNIQUE(student_id, job_id)` constraint on the `applications` table guarantees database-level data integrity even under concurrent requests."

### Q8: What happens when an application status becomes SELECTED?
**Answer**: "When `ApplicationService.updateStatus()` changes an application stage to `SELECTED`, it immediately invokes `StudentDAO.updatePlacementStatus(studentId, PlacementStatus.PLACED)`. This automatically updates the student's global status across all placement reports and dashboard KPIs."

---

## 4. Frontend & React

### Q9: How does the React frontend communicate with the Java backend?
**Answer**: "The React app uses Axios inside a centralized API client module (`services/api.js`). Vite proxies request paths starting with `/api` to the Tomcat servlet container running on port `8080`. Response interceptors unwrap the backend JSON response envelope `{ success, data, count, message }`."

### Q10: How are CORS issues handled?
**Answer**: "A custom Jakarta `@WebFilter("/*")` named `CorsFilter` intercepts incoming requests, attaches `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers` response headers, and returns an HTTP 200 OK for OPTIONS preflight requests."
