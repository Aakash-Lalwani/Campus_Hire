# CampusHire — Architecture

## High-Level Flow

React UI
  |
  | HTTP/JSON via Axios
  v
Java REST-style Servlet API
  |
  v
Service Layer
  |
  v
DAO Layer
  |
  | JDBC / PreparedStatement
  v
MySQL

## Backend Layers

com.campushire
- model/
- dto/
- dao/
- service/
- servlet/
- exception/
- util/
- filter/ (only for CORS/logging if needed)
- config/

### Model
Plain Java domain classes:
Student, Company, Job, Application, Interview.

### DAO
All database access lives here.
Examples:
StudentDAO
CompanyDAO
JobDAO
ApplicationDAO
InterviewDAO
DashboardDAO

### Service
Business logic lives here.
Examples:
StudentService
JobService
EligibilityService
ApplicationService
InterviewService
DashboardService

### Servlet
HTTP boundary only:
parse request -> validate basic input -> call service -> serialize JSON -> response.

Do not put business logic or SQL in servlets.

## Design Principles
- Encapsulation through private fields and getters/setters/constructors.
- Prefer composition over unnecessary inheritance.
- Use interfaces for DAO/service abstractions where they improve clarity.
- Use List/Set/Map meaningfully.
- Use enums for statuses.
- Use custom exceptions for business errors.
- Use Java Streams only where readability improves.
- Keep classes focused and interview-explainable.

## Frontend Structure
src/
- components/
- pages/
- services/
- hooks/
- utils/
- styles/
- App.jsx
- main.jsx

Pages:
Dashboard
Students
Companies
Jobs
Applications
Interviews
StudentPortal

Reusable components:
Sidebar
Topbar
DataTable
Modal
StatusBadge
StatCard
JobCard
FilterBar
EmptyState
LoadingSpinner
ConfirmDialog

## API Error Contract
{
  "success": false,
  "message": "Human readable message",
  "errorCode": "DUPLICATE_APPLICATION"
}

Success example:
{
  "success": true,
  "data": {}
}

For collections:
{
  "success": true,
  "data": [],
  "count": 0
}
