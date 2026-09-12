# CampusHire — Complete Project Architecture & End-to-End Walkthrough

CampusHire is a full-stack campus placement management system built for college placement cells, recruiters, and final-year students.

---

## 1. End-to-End Placement Lifecycle Walkthrough

```
[Student Registration] ──> [Job Opening Posted] ──> [Eligibility Rules Engine]
                                                                │
                                                        (If Eligible)
                                                                ▼
[Student Selected] <── [HR Round] <── [Tech Round] <── [Application Submitted]
        │
        ▼
[Student Placement Status -> PLACED] ──> [Dashboard Aggregate Metrics Update]
```

### Step 1: Student & Company Onboarding
- **Students**: Registered with academic parameters (`branch`, `cgpa`, `graduation_year`, `backlogs`, `skills`). Initial `placement_status` defaults to `NOT_PLACED`.
- **Companies**: Onboarded with industry domain, location, contact representative, and official website details.

### Step 2: Job Drive Creation
- Companies post job openings specifying package (LPA), minimum CGPA cutoff, allowed branches (e.g. `CSE,IT,AI-ML`), maximum backlogs allowed, and application deadline date.

### Step 3: Eligibility Rules Evaluation Engine
When a student attempts to apply (or when an officer runs an eligibility check), `EligibilityService.java` evaluates 5 strict criteria:
1. Is the job status `OPEN`?
2. Is the current date before or equal to `application_deadline`?
3. Is `student.cgpa >= job.min_cgpa`?
4. Is `job.allowed_branches` matching `student.branch`?
5. Is `student.backlogs <= job.max_backlogs`?

If any condition fails, the engine returns `eligible: false` along with a list of human-readable rejection reasons (e.g. *"CGPA (7.20) is below required minimum (7.50)"*).

### Step 4: Application Submission & Duplicate Protection
- Students apply for eligible jobs via `/api/applications`.
- **Duplicate Prevention**: Checked both at the Java Service layer (`ApplicationService.java`) and enforced at the database level via a `UNIQUE(student_id, job_id)` SQL constraint.

### Step 5: Application Pipeline & Interview Scheduling
- **Pipeline Progression**: `APPLIED` → `SHORTLISTED` → `APTITUDE` → `TECHNICAL` → `HR` → `SELECTED` / `REJECTED`.
- **Interview Module**: Scheduling interview rounds (`APTITUDE`, `TECHNICAL`, `HR`) with date, mode (`ONLINE`/`OFFLINE`), interviewer name, and result (`PENDING`, `PASSED`, `FAILED`).
- **Interview Progression Rule**: Marking an HR interview as `PASSED` automatically transitions the application status to `SELECTED`.

### Step 6: Automated Placement Status Update & Analytics
- **Placement Update**: When an application transitions to `SELECTED`, `StudentDAO.updatePlacementStatus` automatically sets the student's status to `PLACED`.
- **Dashboard Analytics**: Real-time SQL aggregations display total placements, placement rate %, placements by branch bar chart, applications by company pie chart, and package distribution.

---

## 2. Layered Software Architecture

```
React (Vite) Single Page Application
  │
  ├── Axios API Client (services/api.js)
  │
  ▼
Jakarta Servlet API (com.campushire.servlet)
  │  (HTTP handling, JSON serialization/deserialization, CORS Filter)
  ▼
Service Layer (com.campushire.service)
  │  (Business logic, Eligibility Engine, Duplicate check, Pipeline transitions)
  ▼
DAO Layer (com.campushire.dao)
  │  (PreparedStatement SQL execution, ResultMapping)
  ▼
JDBC Driver & Connection (DBUtil.java)
  │
  ▼
MySQL 8+ Database (campushire schema)
```
