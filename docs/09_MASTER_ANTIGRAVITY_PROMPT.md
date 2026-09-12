# MASTER ANTIGRAVITY BUILD PROMPT

You are the lead software architect, senior Java developer, senior React developer, QA engineer and technical writer for this project.

Your task is to BUILD the complete CampusHire full-stack application in the current workspace, not merely plan it.

## NON-NEGOTIABLE OUTCOME

Deliver a working, polished, demo-ready campus placement management system suitable for a 4th-year B.Tech CSE/AI-ML student's Cognizant Java FSE interview.

The primary technologies must visibly and meaningfully be:
- Java 17+
- JDBC
- Jakarta Servlets
- Maven
- MySQL 8+
- React
- JavaScript
- Axios
- React Router
- Recharts

Do NOT use:
- Spring Boot
- Spring Security
- JWT
- OAuth
- Microservices
- Docker/Kubernetes
- Kafka
- Redis
- AI/ML
- complex authentication/authorization
- JUnit as a requirement

Do not turn this into a generic tutorial CRUD project.

## SOURCE OF TRUTH

Read these files BEFORE implementation:
- 01_PRD.md
- 02_ARCHITECTURE.md
- 03_DATABASE.md
- 04_API_SPEC.md
- 05_UI_UX.md
- 06_IMPLEMENTATION_PLAN.md
- 07_INTERVIEW_PREP.md
- 08_AGENTS_RULES.md

Treat them as authoritative requirements.

## EXECUTION MODE

Work autonomously from start to finish.

Do NOT ask me to choose between technologies.
Do NOT stop after generating a plan.
Do NOT stop after scaffolding.
Do NOT wait for confirmation between phases.
Do NOT leave core features as TODOs.
If a small implementation decision is unspecified, choose the simplest professional option consistent with the documents.

Use the equivalent of an end-to-end goal/completion workflow: plan, implement, run, verify, fix, and finish.

## FIRST: INSPECT THE ENVIRONMENT

Before coding:
1. Inspect the workspace.
2. Detect Java version.
3. Detect Maven.
4. Detect Node/npm.
5. Detect MySQL availability.
6. Check whether the workspace already contains files.
7. Preserve useful existing files if present.
8. Create a concise implementation plan/task list artifact.

If required software is unavailable, continue building everything possible and clearly document the missing prerequisite and exact setup command. Do not waste the session repeatedly attempting unavailable installations.

## PROJECT STRUCTURE

Prefer:

campushire/
  backend/
  frontend/
  database/
  docs/
  README.md
  .gitignore

Backend:
backend/src/main/java/com/campushire/...
backend/src/main/resources/...

Frontend:
frontend/src/...

Database:
database/schema.sql
database/seed.sql

Docs:
docs/01_PRD.md
docs/02_ARCHITECTURE.md
docs/03_DATABASE.md
docs/04_API_SPEC.md
docs/05_UI_UX.md
docs/06_IMPLEMENTATION_PLAN.md
docs/07_INTERVIEW_PREP.md

Copy or preserve the project-pack documents into docs/ if appropriate.

## BACKEND IMPLEMENTATION

Build a Maven Java web application deployable to Tomcat 10+.

Use a layered architecture:

model
dto
dao
service
servlet
exception
util/config

Implement:
- Student CRUD
- Company CRUD
- Job CRUD
- Eligibility engine
- Application creation/list/update
- Duplicate application prevention
- Application status transitions
- Interview CRUD/scheduling
- Dashboard statistics

Business logic belongs in services.

Database access belongs in DAOs.

HTTP handling belongs in servlets.

Use:
- PreparedStatement
- try-with-resources
- enums
- custom exceptions
- clear validation
- consistent JSON response format

Implement centralized error handling where practical.

Add CORS for local React development.

## ELIGIBILITY ENGINE

Implement this as a real service, not frontend-only logic.

Eligibility requires:
- job OPEN
- deadline not expired
- CGPA >= minCgpa
- student's branch included in allowed branches
- backlogs <= maxBacklogs

Return:
{
  eligible: true/false,
  reasons: []
}

For an ineligible student, reasons should identify failed criteria, e.g.
- "CGPA is below the required minimum."
- "Branch is not eligible."
- "Student exceeds the maximum allowed backlogs."
- "Application deadline has passed."

## APPLICATION WORKFLOW

Implement:
APPLIED
SHORTLISTED
APTITUDE
TECHNICAL
HR
SELECTED
REJECTED

Do not allow nonsensical status changes.

Prevent duplicate student/job applications using both:
- service-layer validation
- database UNIQUE constraint

When an application becomes SELECTED, update the student's placement status appropriately.

## INTERVIEW MODULE

Allow:
- scheduling
- rescheduling/update
- result updates
- remarks

Rounds:
APTITUDE
TECHNICAL
HR

Results:
PENDING
PASSED
FAILED

## DATABASE

Create schema.sql and seed.sql.

Use fictional demo data.

Make seed data sufficient to show:
- eligible students
- ineligible students
- applications
- selected/rejected candidates
- upcoming interviews
- multiple companies and branches

Use foreign keys and indexes from DATABASE.md.

## REST API

Implement all endpoints from 04_API_SPEC.md.

Use correct HTTP methods and status codes.

Use JSON.

Never expose stack traces in API responses.

## FRONTEND

Build a polished React application.

Required pages:
- Dashboard
- Students
- Companies
- Jobs
- Applications
- Interviews
- Student Portal

Required reusable components:
- Sidebar
- Topbar
- StatCard
- DataTable
- Modal
- StatusBadge
- FilterBar
- ConfirmDialog
- LoadingSpinner
- EmptyState

Use React Router.

Use Axios through a centralized API service.

Use Recharts for meaningful dashboard charts.

## DEMO ROLE SELECTOR

Do not implement real authentication.

Provide a simple UI role selector:
- Placement Officer
- Student
- Recruiter

This only changes the demo navigation/experience. It is NOT a security mechanism.

## UI QUALITY BAR

The result should look like a serious final-year project.

Requirements:
- responsive layout
- professional dashboard
- clean sidebar
- consistent cards
- polished tables
- search/filter controls
- status badges
- modal forms
- confirmation dialogs
- loading states
- empty states
- API error states
- success feedback
- sensible spacing and typography

Avoid:
- excessive animations
- childish design
- giant gradients
- placeholder lorem ipsum
- fake statistics when real API data is available

## VALIDATION

Frontend validation:
- required fields
- email format
- CGPA range
- non-negative backlogs
- valid dates

Backend validation must repeat important rules.

## SECURITY BASICS WITHOUT AUTH

Even without authentication:
- use PreparedStatement
- validate input
- never concatenate SQL from user input
- do not commit secrets
- do not expose DB credentials
- do not expose stack traces
- configure CORS narrowly for localhost development

## VERIFICATION

After implementation:

1. Build backend with Maven.
2. Build frontend with npm.
3. Start backend if environment allows.
4. Start frontend if environment allows.
5. Test representative API calls.
6. Test browser UI if browser tooling is available.
7. Check browser console for obvious errors.
8. Check backend logs.
9. Fix failures.
10. Repeat until stable.

At minimum verify:
- student create/read/update/delete
- company CRUD
- job CRUD
- eligibility positive case
- eligibility negative case
- application creation
- duplicate application rejection
- status update
- interview creation/update
- dashboard statistics
- React routing
- React API integration

## DOCUMENTATION

Create/update:
- README.md
- docs/PROJECT_WALKTHROUGH.md
- docs/INTERVIEW_QA.md
- docs/SETUP.md

README must explain:
- project purpose
- architecture
- tech stack
- folder structure
- prerequisites
- database setup
- backend startup
- frontend startup
- default URLs
- API overview
- demo workflow
- troubleshooting

PROJECT_WALKTHROUGH.md must explain the complete flow:
Student -> Eligibility -> Application -> Interview -> Selection -> Dashboard.

INTERVIEW_QA.md must contain concise answers for likely Cognizant questions about:
- OOP
- Collections
- exceptions
- JDBC
- SQL
- REST
- React
- architecture
- project decisions
- challenges
- future improvements

## FINAL QUALITY CHECK

Before declaring completion:
- remove dead code
- remove obvious debug logs
- ensure imports are clean
- ensure README commands are accurate
- ensure database scripts match Java models
- ensure API paths match frontend calls
- ensure no core feature is mocked
- ensure no secrets are committed
- ensure the app starts cleanly as far as available local dependencies permit

Finally create a walkthrough artifact summarizing:
1. what was built
2. files created
3. architecture
4. how to run
5. verification performed
6. known limitations, if any
7. recommended next manual checks

The final result must be a complete working implementation, not a proposal.
