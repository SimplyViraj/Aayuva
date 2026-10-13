# AAYUVYA Project Constitution

This constitution defines the mandatory engineering rules for AAYUVYA, a wellness and healthcare-oriented membership platform that enables members to manage their wellness journey digitally.

The platform supports individual member accounts, family accounts, couple accounts, memberships, membership plans, appointments, therapy sessions, therapy/session credits, wellness programs, program enrollment, digital wellness passports, notifications, reminders, payments, billing, transactions, administrative operations, user profiles, role-based access, and authentication through multiple providers.

These rules are mandatory and must not be silently overridden during development.

---

# Project Technology Standards

The mandatory technology stack is:

- Use React Native for the mobile application.
- Use TypeScript for frontend development.
- Use NestJS for the backend.
- Use TypeScript for backend development.
- Use Node.js as the backend runtime.
- Use PostgreSQL as the database.
- Use Prisma ORM for database access.
- Use Prisma Migrate for database schema migrations.
- Use RESTful APIs for frontend-backend communication.
- Use JWT-based authentication.
- Use Swagger/OpenAPI for API documentation.
- Use Jest for backend testing.
- Use Jest and React Native Testing Library for frontend testing.
- Use Dependency Injection through NestJS.
- Do not replace the approved technology stack without an approved constitutional amendment.

---

# Architecture Rules

- Use a modular monolith architecture for the backend.
- Organize backend functionality using NestJS modules.
- Maintain clear separation of responsibilities between modules.
- Do not introduce microservices unless there is a demonstrated architectural requirement and explicit approval.
- Do not introduce unnecessary architectural complexity.
- Follow separation of concerns.
- Controllers must handle HTTP concerns and must not contain complex business logic.
- Business logic must reside in appropriate services or domain/application layers.
- Database access must not be performed directly inside controllers.
- External integrations must be isolated behind appropriate services or abstractions.
- Use Dependency Injection.
- Follow SOLID principles.
- Prefer simple, maintainable architecture over unnecessary abstraction.
- New architectural patterns must have a clear technical justification.

---

# Backend Rules

- Use NestJS for the backend service layer.
- Use TypeScript.
- Follow NestJS architectural conventions.
- Use modules, controllers, services, guards, interceptors, pipes, filters, and providers where appropriate.
- Controllers must remain thin.
- Business logic must not be implemented inside controllers.
- Use DTOs for API request contracts.
- Validate incoming requests on the backend.
- Use asynchronous operations for I/O-bound operations.
- Use appropriate HTTP status codes.
- Return consistent API responses and error structures.
- Use Dependency Injection for services and other dependencies.
- Do not expose internal database models directly when doing so would expose internal structure or sensitive data.
- Avoid unnecessary abstraction layers.
- Keep services cohesive and maintainable.

---

# Database Rules

- Use PostgreSQL.
- Use Prisma ORM.
- Use Prisma Schema as the source of truth for a new database.
- Use Prisma Migrate for database schema changes.
- Every persistent model must have an appropriate primary key.
- Use relationships and foreign keys where appropriate.
- Use unique constraints where required.
- Use NOT NULL constraints where appropriate.
- Use appropriate database constraints to maintain data integrity.
- Use indexes for frequently searched, filtered, joined, or sorted fields.
- Avoid unnecessary indexes.
- Use appropriate PostgreSQL data types.
- Use transactions when multiple related operations must succeed or fail together.
- Avoid unnecessary database queries.
- Avoid N+1 query problems.
- Retrieve only the fields and relationships required for an operation.
- Do not manually modify generated Prisma client code.
- Do not use raw SQL unless Prisma cannot reasonably support the operation or there is a justified database-specific/performance requirement.
- All raw SQL must be parameterized.
- Database changes must be performed through controlled migrations.
- Database schema changes must be reviewed before being applied to production.

---

# Authentication and Identity Rules

Authentication must be implemented as a centralized backend concern using NestJS.

The backend must be the authoritative source of user identity.

The frontend must never independently determine whether a user is authenticated or authorized.

The application must support the following authentication methods where enabled by the product requirements:

- Email and password
- Mobile number and OTP
- Google Sign-In
- Apple Sign-In

All authentication methods must ultimately resolve to a single internal user identity.

## User Identity Rules

- Every authenticated user must have a unique internal user identifier.
- Authentication providers must not be treated as the application's primary user identifier.
- Provider-specific identifiers such as Google subject IDs or Apple subject IDs must be associated with the internal user identity.
- Email addresses and phone numbers must be normalized before comparison or storage where appropriate.
- The system must prevent accidental creation of duplicate accounts when the same person authenticates using different supported providers.
- Account linking must only occur when the identity can be securely verified.
- The backend must never automatically merge accounts based only on matching unverified information.
- Provider identities must be stored separately from authentication credentials where appropriate.

## Email and Password Authentication

- Password authentication must be implemented only on the backend.
- Passwords must never be stored in plaintext.
- Passwords must be stored using a strong, approved password-hashing algorithm.
- Password hashes must never be returned through APIs.
- Password reset tokens must be short-lived and single-use.
- Password reset requests must not reveal whether an email address belongs to an account.
- Login attempts must be protected against brute-force attacks.
- Authentication endpoints must be rate-limited where appropriate.

## OTP Authentication

- OTP generation and verification must occur on the backend.
- OTPs must be short-lived.
- OTPs must be single-use.
- OTPs must never be stored or logged in plaintext where avoidable.
- OTP verification attempts must be limited.
- OTP generation must be rate-limited.
- Repeated OTP requests must be controlled.
- OTPs must never be returned through API responses.
- OTP verification must invalidate the OTP after successful verification.
- The backend must not trust an OTP verification result supplied by the frontend.
- SMS provider responses must not be treated as authentication proof without proper verification.

## Google Authentication

- Google authentication must use Google's supported authentication mechanisms.
- Google identity tokens must be verified by the backend.
- The backend must validate the token issuer, audience, expiration, and relevant identity claims.
- The application must use the verified Google subject identifier to establish the provider identity.
- The mobile application must never directly decide that a Google login is valid.
- Google authentication must not create duplicate internal users when a verified provider identity is already linked.

## Apple Authentication

- Apple authentication must use Apple's supported authentication mechanisms.
- Apple identity tokens must be verified by the backend.
- The backend must validate the token issuer, audience, expiration, and relevant identity claims.
- The application must use the verified Apple subject identifier to establish the provider identity.
- The backend must correctly handle Apple's private relay email addresses.
- Apple authentication must not create duplicate internal users when a verified provider identity is already linked.

## JWT Access Token Rules

- Protected APIs must use JWT-based authentication unless an explicitly approved alternative is required.
- JWT access tokens must be issued only after successful authentication.
- JWTs must contain only the claims required by the application.
- JWTs must not contain sensitive personal information.
- JWTs must have a defined expiration time.
- JWT signing secrets or private keys must never be hardcoded.
- JWT secrets and signing keys must be provided through secure configuration.
- JWT validation must verify signature, issuer, audience, expiration, and other required claims.
- The backend must never trust an unsigned or improperly validated JWT.
- Expired access tokens must be rejected.
- Invalid tokens must result in an appropriate `401 Unauthorized` response.

## Refresh Token Rules

If refresh tokens are implemented:

- Refresh tokens must be long-lived only when necessary.
- Refresh tokens must be securely generated.
- Refresh tokens must not be stored in plaintext where avoidable.
- Refresh tokens must be revocable.
- Refresh token rotation should be used where appropriate.
- Reuse of a revoked or rotated refresh token must be detected where practical.
- Refresh tokens must not be returned in logs.
- Refresh tokens must not be exposed unnecessarily to application code.
- Logout must invalidate the appropriate refresh-token session.
- Password changes and security-sensitive account changes should invalidate existing sessions where appropriate.

## Session Rules

- Authentication sessions must be identifiable and revocable where required.
- The system should support invalidating sessions after security-sensitive events.
- Users must be able to log out.
- Logout must invalidate the appropriate authentication session or refresh token.
- Authentication state must not depend solely on local frontend state.
- The backend must remain authoritative regarding session validity.

## Authentication Flow Rules

Every protected request must follow this general flow:

1. The client sends an access token.
2. The backend validates the token.
3. The backend establishes the authenticated internal user identity.
4. Authorization rules are evaluated.
5. The requested operation is executed only if authorization succeeds.

Authentication and authorization must remain separate concerns.

Authentication answers:

> "Who is this user?"

Authorization answers:

> "Is this user allowed to perform this operation?"

## Authentication Error Rules

- Invalid credentials must return appropriate authentication errors.
- Expired or invalid access tokens must return `401 Unauthorized`.
- Authenticated users without sufficient permissions must receive `403 Forbidden`.
- Authentication errors must not expose sensitive implementation details.
- Login, password reset, OTP, and account recovery endpoints must avoid unnecessary account enumeration.

## Authentication Security Rules

- Never log passwords.
- Never log OTP values.
- Never log access tokens.
- Never log refresh tokens.
- Never return password hashes.
- Never return authentication secrets.
- Never hardcode authentication secrets.
- Never trust authentication state supplied solely by the frontend.
- Never trust provider identity claims without server-side verification.
- Never bypass authentication for convenience during development in production-equivalent environments.
- Development-only authentication bypasses must never be committed as production behavior.

# Authorization Rules

Authentication and authorization must be implemented separately.

- Implement role-based authorization.
- Authorization must be enforced server-side.
- Roles must never be trusted when supplied directly by the client.
- Protected resources must verify the authenticated user's permissions.
- Resource ownership must be validated where applicable.
- Administrative operations must require appropriate authorization.
- Frontend route protection must not be considered sufficient authorization.
- Authorization checks must be applied consistently across all protected APIs.
- Use NestJS guards and appropriate authorization mechanisms.

# Validation Rules

- Validate all incoming user input.
- Use DTO-based validation.
- Use `class-validator` and `class-transformer`, or an explicitly approved equivalent.
- Validate required fields.
- Validate data types.
- Validate string lengths.
- Validate identifiers.
- Validate dates.
- Validate numeric values.
- Validate enumerations.
- Validate business constraints where appropriate.
- Never rely exclusively on frontend validation.
- Backend validation must always be enforced for security-sensitive and business-critical data.

---

# API Rules

- Use RESTful API conventions.
- Use resource-oriented endpoint naming.
- Use appropriate HTTP methods.
- Use appropriate HTTP status codes.
- Use DTOs for API contracts.
- Do not expose database entities directly when inappropriate.
- Maintain consistent API response structures.
- Maintain consistent API error structures.
- Validate all API inputs.
- Document APIs using Swagger/OpenAPI.
- Keep API documentation synchronized with implementation.
- Breaking API changes must be explicitly documented.
- API versioning must be introduced when required by breaking changes.

---

# Frontend Rules

- Use React Native.
- Use TypeScript.
- Do not connect the mobile application directly to PostgreSQL.
- All backend communication must occur through approved APIs.
- Do not store backend secrets in the mobile application.
- Do not implement authoritative business rules exclusively in the frontend.
- Use a centralized API/service layer.
- Use typed API contracts where practical.
- Implement protected navigation where authentication is required.
- Handle loading states.
- Handle success states.
- Handle empty states.
- Handle error states.
- Handle unauthorized responses.
- Handle network failures.
- Use reusable components.
- Avoid unnecessary component complexity.
- Avoid unnecessary re-renders.
- Avoid duplicated business logic across screens.
- Keep presentation logic separate from business logic.

---

# Coding Standards

- Follow SOLID principles.
- Write clean, maintainable, production-quality code.
- Use meaningful names for classes, interfaces, methods, functions, variables, DTOs, modules, and files.
- Follow consistent naming conventions.
- Prefer readable code over clever or unnecessarily complex code.
- Keep methods and functions focused.
- Avoid duplicated code.
- Avoid unnecessary abstraction.
- Prefer composition over unnecessary inheritance.
- Use Dependency Injection.
- Use strong typing.
- Avoid `any` unless explicitly justified.
- Do not suppress compiler or linter warnings without justification.
- Avoid magic numbers and hardcoded configuration values.
- Use constants or configuration for configurable values.
- Comments must explain non-obvious decisions and must not merely restate the code.
- Follow existing project conventions when they do not conflict with this constitution.

---

# Security Rules

- Enforce HTTPS in production.
- Validate and sanitize user input where appropriate.
- Protect against SQL injection.
- Protect authentication endpoints against brute-force attacks.
- Apply rate limiting to sensitive endpoints where appropriate.
- Do not log passwords.
- Do not log OTPs.
- Do not log access tokens.
- Do not log refresh tokens.
- Do not log payment credentials.
- Do not expose secrets in API responses.
- Do not expose internal exception details in production.
- Never hardcode secrets.
- Never commit secrets to source control.
- Use environment variables or an approved secret-management mechanism.
- Follow the principle of least privilege.
- Protect administrative functionality.
- Apply authorization checks to protected resources.
- Security requirements must never be weakened for development convenience.

---

# Configuration Rules

- Configuration must be environment-specific.
- Support appropriate development, testing, staging, and production configurations.
- Use environment variables or an approved secret-management solution for secrets.
- Do not commit secret-containing `.env` files.
- Do not hardcode environment-specific values.
- Validate critical configuration during application startup where appropriate.
- Keep configuration separate from application business logic.

---

# Logging and Exception Handling Rules

- Implement centralized logging.
- Use structured logging where appropriate.
- Implement centralized exception handling.
- Use NestJS exception filters or an equivalent mechanism.
- Return consistent API error responses.
- Log exceptions with meaningful technical information.
- Do not expose stack traces in production API responses.
- Do not log sensitive information.
- Use appropriate log levels.
- Include request or correlation identifiers where appropriate.
- Exception handling must not hide failures silently.

---

# Performance Rules

- Avoid unnecessary database calls.
- Avoid N+1 query problems.
- Use pagination for large result sets.
- Use indexes for frequently queried fields.
- Retrieve only required database fields.
- Avoid unnecessarily loading relationships.
- Use asynchronous operations for I/O-bound operations.
- Avoid unnecessary API calls.
- Avoid unnecessary frontend re-renders.
- Do not introduce caching without a demonstrated requirement.
- Do not introduce Redis, queues, message brokers, or other infrastructure without a documented technical reason.
- Performance optimizations must not compromise correctness or security.

---

# Testing Rules

- Use Jest for backend unit testing.
- Use Supertest for API/integration testing where appropriate.
- Use Jest for frontend testing.
- Use React Native Testing Library for frontend component and interaction testing.
- Write unit tests for business logic.
- Write tests for controllers where appropriate.
- Write tests for services.
- Write tests for validation.
- Write tests for authorization behavior where appropriate.
- Test success scenarios.
- Test failure scenarios.
- Test exception scenarios.
- Test important edge cases.
- New business logic must include appropriate automated tests.
- Bug fixes should include regression tests where appropriate.
- Unit tests must not connect directly to production databases.
- External dependencies must be mocked or isolated appropriately.
- Tests must verify behavior rather than implementation details.
- Tests must be deterministic and repeatable.

---

# Git and Development Rules

- Development must be performed in small, logical changes.
- Do not modify unrelated functionality while implementing a task.
- Do not introduce unnecessary dependencies.
- Every feature must build successfully before being considered complete.
- Relevant tests must pass before a task is considered complete.
- Database changes must use Prisma migrations.
- Breaking API changes must be documented.
- Secrets and local environment files must not be committed.
- Generated artifacts that do not belong in source control must not be committed.
- Architectural changes must be documented where appropriate.

---

# Development Workflow

The following workflow must be followed when implementing features or significant changes:

1. Review this constitution.
2. Understand the requirements.
3. Identify affected architectural layers and modules.
4. Design or update the database model where required.
5. Review database relationships, constraints, and indexes.
6. Create the required Prisma migration.
7. Implement or update the appropriate NestJS module.
8. Implement DTOs and validation.
9. Implement business/application services.
10. Implement database/data-access operations.
11. Implement authentication and authorization requirements.
12. Implement required external integrations.
13. Implement REST API controllers and endpoints.
14. Update Swagger/OpenAPI documentation.
15. Implement frontend API integration.
16. Implement required React Native components and screens.
17. Implement loading, success, empty, and error states.
18. Write backend tests using Jest.
19. Write API/integration tests where appropriate.
20. Write frontend tests using Jest and React Native Testing Library.
21. Run linting and static analysis.
22. Run backend tests.
23. Run frontend tests.
24. Build the backend and frontend.
25. Review security and authorization.
26. Review database integrity and performance.
27. Verify compliance with this constitution.
28. Only then consider the task complete.

---

# AI Code Generation Rules

- Always follow this constitution before generating code.
- Treat this constitution as mandatory project-level guidance.
- Do not replace the approved technology stack.
- Do not skip mandatory architectural rules.
- Do not skip security requirements.
- Do not skip validation requirements.
- Do not skip testing requirements.
- Do not introduce unnecessary dependencies.
- Do not introduce unnecessary architecture.
- Do not silently violate constitutional rules.
- Do not modify unrelated functionality.
- Follow existing project patterns when they comply with this constitution.
- Generate clean, maintainable, production-quality code.
- Follow SOLID principles.
- Use meaningful names.
- Prefer simple and readable implementations.
- Generate only what is required for the current task unless a full implementation is explicitly requested.
- Consider security, validation, authorization, database integrity, performance, and testing when generating code.
- Never expose secrets or sensitive information in generated code.
- Never trust client-controlled values for security-critical decisions.

If a requested implementation conflicts with this constitution:

1. Identify the conflict.
2. State which constitutional rule is affected.
3. Suggest a compliant alternative.
4. Do not silently implement the conflicting approach.

---

# Governance

## Constitutional Authority

This constitution is the authoritative engineering rule set for the project.

All:

- Specifications
- Plans
- Tasks
- Architecture decisions
- Database changes
- API implementations
- Frontend implementations
- Backend implementations
- Tests
- AI-generated code

must comply with this constitution.

## Technology Governance

The approved technology stack must not be replaced without an explicit constitutional amendment.

Changes to the following require approval:

- Frontend framework
- Backend framework
- Programming language
- Database
- ORM
- Authentication architecture
- Authorization architecture
- Testing framework
- API architecture

## Architectural Governance

New architectural patterns must have a documented technical justification.

Microservices must not be introduced without a demonstrated requirement.

Additional infrastructure such as Redis, queues, message brokers, or caching systems must not be introduced without justification.

## Security Governance

Security rules are mandatory.

No implementation may weaken authentication, authorization, validation, secrets management, HTTPS, or sensitive-data protection for convenience.

## Exception Governance

Any exception to a mandatory rule must:

- Be explicitly identified.
- Have a documented technical justification.
- Identify affected components.
- Describe the impact.
- State whether the exception is temporary or permanent.

## Amendment Governance

Changes to this constitution must be versioned and documented.

Every amendment must specify:

- The rule being changed.
- The reason for the change.
- The technical justification.
- The impact.
- The affected components.
- The migration or compatibility strategy where applicable.

Constitutional changes must not be made simply to bypass implementation difficulty.

## Compliance Governance

Before a feature is considered complete, the implementation must be reviewed for compliance with:

- Architecture rules
- Coding rules
- Database rules
- Security rules
- Testing rules
- Performance rules
- API rules
- Frontend rules
- Development workflow rules

---

# Constitution Metadata

**Constitution Version:** 1.0.0

**Ratification Date:** 2026-10-02

**Last Amended Date:** 2026-10-02
