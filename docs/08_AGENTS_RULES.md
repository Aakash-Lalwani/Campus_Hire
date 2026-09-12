# Antigravity Workspace Rules — CampusHire

These rules should be applied throughout development.

1. Treat the files in this project pack as the source of truth.
2. Do not replace the requested Java + JDBC + Servlet architecture with Spring Boot.
3. Do not add JWT, OAuth, Spring Security, microservices, Docker, Kafka, Redis or AI features.
4. Prefer simple, readable, interview-explainable code over unnecessary abstraction.
5. Never put SQL in servlet classes.
6. Never put business rules in React.
7. Keep business rules in Java service classes.
8. Use PreparedStatement for all SQL containing user/application data.
9. Validate input on both frontend and backend.
10. Use enums for workflow/status values.
11. Use custom exceptions for meaningful business failures.
12. Do not silently swallow exceptions.
13. Do not leave TODO placeholders for core functionality.
14. Do not claim a feature is complete without running a relevant verification step.
15. When an error occurs, diagnose and fix it rather than merely describing it.
16. Preserve working code when adding features.
17. Avoid unnecessary dependencies.
18. Keep naming professional and consistent.
19. Use realistic but fictional seed data.
20. Do not include secrets in source control.
21. Put DB configuration in environment/config files and provide an example config.
22. Keep API responses consistent.
23. Keep UI responsive and professional.
24. Always handle loading, empty and error states.
25. Before finishing, run builds and smoke tests and produce a walkthrough.
