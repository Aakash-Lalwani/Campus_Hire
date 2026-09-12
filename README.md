# CampusHire — Modern Campus Placement & Recruitment SaaS Platform

CampusHire is a full-stack campus placement and recruitment operations platform that digitizes the end-to-end recruitment lifecycle — student registration, recruiter management, drive posting, 5-condition automated eligibility evaluation, ATS candidate pipeline tracking, and interview scheduling — built with a Spring Boot 3 + React 18 architecture.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, React Router 6, Axios, Recharts, Lucide Icons, Vanilla CSS |
| **Backend** | Java 21, Spring Boot 3.3.4, Spring Web, Spring Data JPA, Hibernate 6, Bean Validation |
| **Database** | MySQL 8.x / Docker MySQL 8 |
| **Migration** | Flyway Community 10.x |
| **Infrastructure** | Docker Compose, Multi-stage Dockerfiles, Nginx Reverse Proxy |

---

## System Architecture

```
React (Vite :5173 / Nginx :80)
      │
      │ HTTP / REST API (/api)
      ▼
Spring Boot Controller Layer (:8080)
      │
      │ DTOs & Bean Validation
      ▼
Spring @Service Layer (Transactions & Business Rules)
      │
      │ Spring Data JPA
      ▼
Hibernate 6 (ddl-auto: validate)
      │
      │ JDBC
      ▼
MySQL 8 (Automated Flyway Migrations: V1 Schema, V2 Seed)
```

---

## Key Features

1. **Executive Placement Dashboard**: Real-time KPI metrics (Students, Companies, Open Jobs, Applications, Placed, Placement Rate), department placement charts, application distribution by recruiter, and 4-tier compensation distribution (`< 5 LPA`, `5–10 LPA`, `10–20 LPA`, `> 20 LPA`).
2. **Student Directory**: Student roster with CGPA badges, active backlogs monitoring, department filters, and placement status tracking.
3. **Partner Recruiters**: Corporate recruiter management, representative contact details, locations, and verified external links.
4. **Placement Drives & Job Postings**: Role announcements, compensation (LPA), minimum CGPA cutoffs, max backlog limits, and live application deadlines.
5. **Interactive Eligibility Engine**: Automated 5-rule evaluation engine checking CGPA cutoffs, backlog thresholds, department matching, deadline validity, and duplicate application prevention with exact failure reasons.
6. **Applicant Tracking System (ATS)**: Multi-stage candidate progression pipeline (`APPLIED → SHORTLISTED → APTITUDE → TECHNICAL → HR → SELECTED`), with terminal `REJECTED` handling and automatic student placement status synchronization upon final selection.
7. **Interview Management**: Multi-round interview tracking (Aptitude, Technical, HR), panel interviewer assignments, modality (Online/In-Person), and one-click `Pass`/`Fail` evaluation.
8. **Student Portal**: Candidate self-service portal with profile overview, live drive eligibility evaluation, instant `Apply Now` action, and application/interview schedule tracker.

---

## Getting Started

### Prerequisites

- **Java**: 21 LTS
- **Maven**: 3.9+
- **Node.js**: 18+ and npm
- **Database**: MySQL 8+ or Docker

---

### Environment Configuration

A template configuration file is provided at `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile (`dev`, `prod`) | `dev` |
| `SPRING_DATASOURCE_URL` | MySQL JDBC Connection URL | `jdbc:mysql://localhost:3306/campushire` |
| `SPRING_DATASOURCE_USERNAME` | MySQL Username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | MySQL Password | *(empty or configured)* |
| `SERVER_PORT` | Backend HTTP Port | `8080` |
| `VITE_API_BASE_URL` | Frontend API Base URL | `/api` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS Origins | `http://localhost:5173,http://localhost:3000` |

---

### Database & Flyway Migrations

Flyway automatically applies all schema and seed migrations on application startup:
- `V1__init_schema.sql`: Tables for `students`, `companies`, `jobs`, `applications`, and `interviews`.
- `V2__seed_demo_data.sql`: Production demo seed with 15 candidates, 6 companies, 9 jobs, 20 applications, and 12 interview rounds.

Manual database creation (if running standalone MySQL):

```sql
CREATE DATABASE campushire CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### Running the Application Locally

#### 1. Start the Backend

```bash
cd backend
mvn clean test
mvn spring-boot:run
```

The Spring Boot backend will start on `http://localhost:8080`.

#### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will start on `http://localhost:5173` and automatically proxy `/api` requests to `http://localhost:8080`.

---

### Running with Docker Compose

To launch the complete multi-container stack (MySQL 8, Spring Boot JAR, and React/Nginx):

```bash
docker compose up --build
```

- **Frontend Application**: `http://localhost`
- **Backend API**: `http://localhost:8080/api`
- **MySQL Database**: `localhost:3306`

---

### Production Verification

Run the automated test suite and production bundle build:

```bash
# Backend test suite (36 unit, integration, and Flyway tests)
cd backend && mvn test

# Frontend production bundle
cd frontend && npm run build
```

---

## License

This project is licensed under the MIT License.
