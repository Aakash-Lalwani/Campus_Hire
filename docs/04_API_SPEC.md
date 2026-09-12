# CampusHire — API Specification

Base URL: /api

## Students
GET /students
GET /students/{id}
POST /students
PUT /students/{id}
DELETE /students/{id}

## Companies
GET /companies
GET /companies/{id}
POST /companies
PUT /companies/{id}
DELETE /companies/{id}

## Jobs
GET /jobs
GET /jobs/{id}
POST /jobs
PUT /jobs/{id}
DELETE /jobs/{id}
GET /jobs/{jobId}/eligibility/{studentId}

## Applications
GET /applications
GET /applications/{id}
GET /students/{studentId}/applications
POST /applications
PUT /applications/{id}/status
DELETE /applications/{id}

## Interviews
GET /interviews
POST /interviews
PUT /interviews/{id}
DELETE /interviews/{id}

## Dashboard
GET /dashboard/stats
GET /dashboard/placements-by-branch
GET /dashboard/applications-by-company
GET /dashboard/package-distribution

## Query Parameters
Support useful filtering where practical:
- ?search=
- ?branch=
- ?status=
- ?companyId=
- ?page=
- ?size=

Pagination may be implemented for the largest tables, but do not over-engineer it.

## HTTP Status Codes
200 success
201 created
400 validation error
404 resource not found
409 business conflict
500 unexpected server error
