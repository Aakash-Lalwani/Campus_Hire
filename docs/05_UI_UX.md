# CampusHire — UI/UX Specification

## Visual Direction
Professional enterprise dashboard. It should look like a polished final-year project, not a tutorial CRUD app.

Use:
- modern sidebar
- clean top navigation
- cards with subtle borders/shadows
- consistent spacing
- responsive tables
- badges for statuses
- modal forms
- search and filter controls
- charts on dashboard
- professional typography
- accessible contrast
- no excessive gradients or animations

## Layout

Desktop:
Sidebar | Main Content

Sidebar:
- Dashboard
- Students
- Companies
- Jobs
- Applications
- Interviews
- Student Portal

Topbar:
- page title
- search/context
- demo role selector
- profile placeholder

## Dashboard
Top row:
Total Students | Companies | Open Jobs | Students Placed

Second row:
Placement Percentage chart | Applications by Company chart

Third row:
Recent Applications | Upcoming Interviews

## Students
Toolbar:
Search | Branch filter | Placement status filter | Add Student

Table:
Name | Branch | CGPA | Backlogs | Skills | Placement Status | Actions

## Jobs
Use job cards/table:
Company | Role | Package | Min CGPA | Deadline | Status | Eligible Students | Actions

## Student Portal
Show:
Profile summary
Eligible jobs
Application status timeline
Upcoming interviews
Offer/placement summary

## UX Rules
- Every form has client-side validation.
- Server remains authoritative.
- Show loading state for API calls.
- Show friendly error messages.
- Disable submit during request.
- Confirm delete.
- Show empty-state message when lists are empty.
- Avoid exposing stack traces to users.
