# CampusHire

A full-stack campus placement management system that digitizes the end-to-end placement process — from student registration to company drives and offer tracking — built on a modern Spring Boot + React architecture.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React.js                                |
| Backend    | Java 17, Spring Boot, Spring Data JPA   |
| ORM        | Hibernate (via Spring Data JPA)         |
| Database   | MySQL 8                                 |
| Server     | Embedded Tomcat (Spring Boot)           |

---

## Project Structure

```
CampusHire/
├── backend/                        # Spring Boot application
│   ├── src/main/java/com/campushire/
│   │   ├── controller/             # REST controllers (@RestController)
│   │   ├── service/                # Business logic layer (@Service)
│   │   ├── repository/             # JPA repositories (Spring Data)
│   │   ├── model/                  # JPA entities (@Entity)
│   │   ├── dto/                    # Data Transfer Objects
│   │   └── CampusHireApplication.java
│   ├── src/main/resources/
│   │   └── application.properties  # DB config, JPA settings, server port
│   └── pom.xml
├── frontend/                       # React application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Student and Admin portal pages
│   │   ├── services/               # Axios API service calls
│   │   └── App.jsx
│   ├── package.json
│   └── .env                        # API base URL config
├── database/                       # SQL scripts — schema and seed data
│   ├── schema.sql
│   └── seed.sql
└── docs/                           # Project documentation
```

---

## Features

### Student Portal
- Register and log in with secure authentication
- Build a placement profile: branch, CGPA, skills, and resume link
- Browse available company drives with eligibility details
- Apply to drives directly through the portal
- Track application stage and status in real time

### Admin Portal
- Secure admin login and dashboard
- Add, update, and remove companies (package, role, location, eligibility criteria)
- Create and manage placement drives per company
- View all applicants for a drive with sortable and filterable lists
- Update application status and advance candidates through hiring stages

---

## How It Works

```
React Frontend (port 3000)
        │
        │  HTTP/JSON (Axios)
        ▼
Spring Boot Embedded Server (port 8080)
        │
        │  @RestController — request mapping, input validation, response serialization
        ▼
@Service Layer — business logic, authorization rules, workflow orchestration
        │
        │  Spring Data JPA
        ▼
JPA Repositories + Hibernate ORM
        │
        │  JDBC (managed by Hibernate)
        ▼
MySQL Database
```

The React frontend communicates with the backend over HTTP using Axios. Spring Boot's embedded server handles incoming requests and routes them to the appropriate `@RestController`. Controllers delegate business logic to `@Service` classes, which interact with the database through Spring Data JPA repositories backed by Hibernate.

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- MySQL 8+
- Node.js 18+ and npm

### Database Setup

Create the database and run the provided scripts:

```sql
CREATE DATABASE campushire;
USE campushire;
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

### Backend Setup

1. Open `backend/src/main/resources/application.properties` and update the datasource credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campushire
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
```

2. Build and run the Spring Boot application:

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The API server starts at `http://localhost:8080`.

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React app runs at `http://localhost:3000` and proxies API requests to the Spring Boot backend at `http://localhost:8080`.

---

## Database Design

| Table          | Purpose                                                    |
|----------------|------------------------------------------------------------|
| `students`     | Student profiles — branch, CGPA, skills, contact info      |
| `companies`    | Company details — offered role, package, location          |
| `drives`       | Placement drives linked to a company with eligibility rules |
| `applications` | Student–drive mapping with status and stage tracking       |
| `admins`       | Admin credentials and access control                       |

---

## Author

**Aakash Lalwani**
