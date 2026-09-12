# CampusHire — Implementation Plan

Antigravity should execute this in one autonomous run.

## Phase 0 — Workspace and Environment
- Inspect workspace.
- Detect installed Java, Maven, Node, npm, MySQL.
- If missing, do not install silently; document the missing prerequisite.
- Create project folders.
- Initialize Git repository if not already present.
- Create .gitignore.

## Phase 1 — Backend Foundation
- Create Maven Java backend.
- Configure Java 17+.
- Add Jakarta Servlet API, MySQL Connector/J and JSON library.
- Configure Tomcat deployment.
- Implement DB connection utility using environment/config properties.
- Add schema.sql and seed.sql.
- Add CORS support for local React development.
- Add common JSON response/error helpers.

## Phase 2 — Domain and DAO
Implement:
- models/enums
- DAO interfaces/classes
- prepared statements
- CRUD operations
- relationship queries
- dashboard aggregate queries

## Phase 3 — Services
Implement:
- validation
- eligibility engine
- duplicate application prevention
- application status transitions
- interview scheduling rules
- dashboard calculations
- custom exceptions

## Phase 4 — Servlets/API
Implement all endpoints from API_SPEC.md.
Ensure:
- correct HTTP methods
- path parameters
- JSON request parsing
- JSON responses
- proper status codes
- no SQL in servlet
- no business logic in servlet

## Phase 5 — React
- Create Vite React app.
- Install Axios, React Router and Recharts.
- Create routing/layout.
- Build reusable components.
- Build all pages.
- Connect every page to backend APIs.
- Implement loading/error/empty states.

## Phase 6 — Integration
- Configure frontend API base URL.
- Verify CORS.
- Verify every CRUD operation.
- Verify eligibility.
- Verify application flow.
- Verify interview flow.
- Verify dashboard numbers.

## Phase 7 — Verification
Run:
- Maven build
- frontend build
- backend startup
- frontend startup
- API smoke tests
- browser UI verification if browser tools are available.

Fix discovered issues before finishing.

## Phase 8 — Documentation
Create:
- README.md
- PROJECT_WALKTHROUGH.md
- INTERVIEW_QA.md
- API_SPEC.md
- DATABASE.md
- ARCHITECTURE.md

README must contain exact Windows commands where possible.

## Definition of Done
Do not stop after scaffolding. The project is done only when:
- backend compiles
- frontend compiles
- database scripts work
- APIs respond
- UI loads
- core flows work end-to-end
- no obvious console/runtime errors remain
- documentation exists
