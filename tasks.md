# AAYUVYA — Authentication and Authorization Tasks

## 1. Document Metadata

| Field | Value |
| --- | --- |
| Feature name | Authentication, identity continuity, sessions, recovery and protected access |
| Feature identifier | Unassigned in the source documents. `DEV-*` and `IT-*` are local task identifiers, not an approved feature identifier or branch. |
| Creation date | 2026-10-13, Asia/Calcutta |
| Status | All tasks authorized for execution on 2026-10-13. DEV-001–DEV-009 implemented within foundation scope; IT-001/IT-002 pass. Owner accepted IT-003 with release-remediation gates retained. DEV-010 is in progress; later implementation remains dependency-gated. |
| Source plan | [plan.md](plan.md), especially Sections 3, 9 and 10 |
| Related specification | [specifications.md](specifications.md), SRC-013; US-002–US-004 and US-017; bounded supporting portions of US-001 and US-016 |
| Engineering authority | [constitution.md](constitution.md), version 1.0.0 |
| Approval context | The implementation request and reply “All the tasks in tasks.md” authorize execution of this task list. Existing source classifications and unresolved DEC/CLR entries are preserved; task selection does not supply missing policy decisions or stakeholder signoff. |
| Task state | DEV-001–DEV-009 complete within foundation scope. [Foundation evidence](docs/foundation-validation.md) links checks, review, modified files and remaining gates. Current execution state is in [docs/execution-register.md](docs/execution-register.md); owner decisions and the explicit Twilio exception are in [docs/approved-policies.md](docs/approved-policies.md). |

### 1.1 Source and execution conventions

`US`, `FR`, `BR`, `SEC`, `INT`, `EC`, `NFR`, `SC`, `SRC` and `CLR` references resolve to [specifications.md](specifications.md). `DEL`, `DEC`, `VAL` and numbered plan sections resolve to [plan.md](plan.md). Constitutional references resolve to [constitution.md](constitution.md). ID ranges are inclusive.

Task acceptance criteria describe implementation deliverables and evidence. Product requirements, business rules, validation limits, edge-case outcomes and story acceptance scenarios remain in the specification and are incorporated by reference. The plan's VAL catalog organizes execution of that evidence; it does not replace the specification.

Follow the source classifications in specification Section 1.1 and plan Section 1.1. Record required decisions with their source, responsible decision-maker, date, affected tasks and approval status. A test fixture cannot close a policy decision. Unresolved mandatory behavior blocks the affected task or phase; it is not an implicit omission or an approved default.

Use the constitutional Development Workflow and plan Section 10.4 for every significant change. Each development task includes appropriate behavior tests, relevant lint/type checks, synchronized documentation and review of its affected layers. Section 4 supplies additional integration evidence and mandatory phase exits; testing does not wait until DEL-007.

No implementation, installation, migration execution, provider setup, source-document amendment or deployment is performed by this task document. Future execution requires an implementation request.

## 2. Feature Breakdown

### 2.1 Implementation order

| Order / phase | Feature and scope | Development tasks | Integration and testing tasks | Required predecessor / exit |
| --- | --- | --- | --- | --- |
| 1 — DEL-001 | Reviewed baseline and shared engineering safeguards; technical prerequisites only | DEV-001–DEV-009 | IT-001–IT-003 | Source review; exit IT-003 |
| 2 — DEL-002 | US-001 account-establishment prerequisites, bounded to authentication | DEV-010–DEV-017 | IT-004–IT-007 | IT-003 and applicable decision closure; exit IT-007 |
| 3 — DEL-003 | US-002 selected authentication methods and initial authenticated access | DEV-018–DEV-025 | IT-008–IT-011 | IT-007; exit IT-011 for the complete selected matrix |
| 4 — DEL-004 | US-003 secure additional-method association and identity continuity | DEV-026–DEV-030 | IT-012–IT-014 | IT-011; exit IT-014 |
| 5 — DEL-005 | US-004 continued sessions, logout and eligible recovery | DEV-031–DEV-039 | IT-015–IT-019 | IT-014; exit IT-019 |
| 6 — DEL-006 | US-017 actual role/ownership coverage; US-016 access boundary only | DEV-040–DEV-045 | IT-020–IT-022 | IT-019; exit IT-022 |
| 7 — DEL-007 | Integrated slice validation and verification handoff | DEV-046–DEV-048 | IT-023–IT-027 | IT-022 and release-slice decision closure; exit IT-027 |

Implement and validate one story before starting the next, as required by plan Section 9. Shared identity, session and access safeguards are prerequisites, not early completion of later stories. DEL-002 uses isolated primary-authentication fixtures where DEL-003 functionality is unavailable; DEL-003 replaces those fixtures in real journeys and revalidates the account-establishment slice.

### 2.2 Module and folder references

Use the user-proposed `mobile/` and `backend/` organization as task placement guidance, subject to the compatibility review in DEV-002. The following references assign work without defining new architecture, contracts, schemas or screen designs.

| Task area | Proposed location |
| --- | --- |
| Mobile entry, authentication and protected navigation | `mobile/app/_layout.tsx`, `mobile/app/index.tsx`, `mobile/app/(auth)/`, `mobile/app/(app)/` |
| Mobile authentication behavior and presentation | `mobile/src/features/auth/{components,hooks,services,schemas,types,utils}/` |
| Shared mobile integration and feedback | `mobile/src/lib/{api,config,storage}/`, `mobile/src/providers/`, `mobile/src/components/{ui,feedback}/`, `mobile/src/theme/` |
| Mobile tests and configuration | `mobile/__tests__/`, `mobile/app.json`, `mobile/package.json`, `mobile/tsconfig.json`, `mobile/.env.example` |
| Backend bootstrap and cross-cutting safeguards | `backend/src/main.ts`, `backend/src/app.module.ts`, `backend/src/config/`, `backend/src/common/` |
| Authentication and external adapters | `backend/src/modules/auth/`, including DTOs, strategies and providers |
| Canonical identity and association | `backend/src/modules/identity/` |
| Session responsibilities | Proposed `backend/src/modules/sessions/`; reconcile placement with plan Section 4.1 in DEV-002 |
| Authorization and ownership policies | `backend/src/modules/authorization/`, including guards and policies |
| Persistence | `backend/src/database/`, `backend/prisma/` |
| Backend integration tests and setup guidance | `backend/test/`, `backend/.env.example`, `backend/README.md` |

Plan Section 4.1 initially places session services within authentication; the supplied folder proposal separates them. DEV-002 records the placement choice without changing responsibility or trust boundaries. The route notation also requires compatibility review; it does not silently select a navigation dependency. Create files only when their tasks need them, including any test-only seed data. The proposed tree is not a requirement to populate every folder.

The supplied launch illustration informs session-check and navigation tasks DEV-008, DEV-017, DEV-025 and DEV-039. It does not approve dashboard content, extra account states or a broader onboarding product. Scope exclusions remain those in plan Section 1.2 and specification Section 1.2; authorization validation uses controlled resource fixtures where later business modules do not exist.

## 3. Development Tasks

### 3.1 DEL-001 — Reviewed baseline and shared safeguards

#### [x] DEV-001 — Establish the execution and decision register

- **Service / Module:** Delivery documentation and source traceability.
- **Objective:** Map the selected story portions, requirements, DEC entries and VAL cases to this task list; identify the reviewer responsible for each unresolved prerequisite. Source: plan Sections 1–3 and 9; SRC-013 and CLR-001.
- **Dependencies:** None; first execution task after implementation authorization.
- **Acceptance Criteria:** The register covers DEC-001–DEC-018 and relevant CLR entries, preserves their source status, and identifies the first affected task and required decision evidence. The bounded US-001/US-016 scope and phase-exit owners are recorded. No full-product approval is inferred.
- **Execution evidence (2026-10-13):** [Execution and decision register](docs/execution-register.md) established with scope, requirement/VAL mapping, all decision gates and phase-exit responsibilities. The requesting project owner accepted product/security/privacy/phase-exit ownership and supplied [approved decisions](docs/approved-policies.md). DEV-001 is complete; technical selections require the owner’s separate review before implementation.

#### [x] DEV-002 — Confirm stack, build compatibility and folder placement

- **Service / Module:** Mobile/backend tooling and module placement.
- **Objective:** Review the proposed folders against plan Sections 2.2, 4.1 and 7.2–7.3; select compatible versions and necessary dependencies within the mandated stack. Resolve session placement and navigation tooling before scaffolding.
- **Dependencies:** DEV-001; technical portions of DEC-011 and DEC-015.
- **Acceptance Criteria:** A reviewed dependency/version record cites documentation checked for the selected versions, assigns Expo Go versus development-build validation, and records Android/iOS build prerequisites. Folder placement decisions are documented without changing the plan or adding infrastructure.
- **Review evidence (2026-10-13):** [Technical baseline](docs/technical-baseline.md) records primary-source/registry checks, placement and build prerequisites. The owner's subsequent “all revisions are approved” accepts R1 and workspace installation/scaffolding. DEV-002 is complete; [DEV-003 evidence](docs/foundation-validation.md) records passing checks/builds, with provider/device activation retaining its later gates.

#### [x] DEV-003 — Establish the mobile and backend project foundations

- **Service / Module:** `mobile/`; backend bootstrap; package and TypeScript configuration.
- **Objective:** Create the minimum approved project foundations and repeatable development/check commands using DEV-002 decisions. Source: plan DEL-001 and constitutional Project Technology Standards, Coding Standards and Git and Development Rules.
- **Dependencies:** DEV-002.
- **Acceptance Criteria:** Backend and compatible mobile starter builds run using documented commands; lint and type checks execute successfully. Project boundaries match the recorded placement decisions, and generated scaffolding introduces no unrelated feature behavior.

#### [x] DEV-004 — Implement validated environment configuration

- **Service / Module:** `backend/src/config/`; `mobile/src/lib/config/`; environment examples.
- **Objective:** Implement configuration loading, required-setting validation and method activation controls from plan Sections 3 and 8.2. Separate public mobile settings from backend configuration.
- **Dependencies:** DEV-003; applicable configuration decisions from DEV-001 before activating their behavior.
- **Acceptance Criteria:** Configuration tests exercise all implemented activation conditions; environment examples contain placeholders and startup guidance. Review evidence covers constitutional Configuration and Security Rules and SEC-010–SEC-012. Unresolved settings remain visibly gated.

#### [x] DEV-005 — Implement shared validation, exceptions and safe diagnostics

- **Service / Module:** Backend common pipes, filters, errors, interceptors and logging; shared mobile feedback.
- **Objective:** Establish reusable DTO validation, error handling, correlation and redaction behavior from plan Sections 7.1 and 8.1–8.2. Source: FR-043–FR-044; SEC-010–SEC-012.
- **Dependencies:** DEV-004; DEC-016 for any policy-dependent diagnostic data.
- **Acceptance Criteria:** Shared behavior is covered by focused tests and the applicable VAL-012 cases. Service/controller adoption guidance and permitted diagnostic fields are recorded; no product retention schedule is invented.

#### [x] DEV-006 — Establish reviewed persistence foundations

- **Service / Module:** Backend database service and Prisma migration tooling.
- **Objective:** Implement the foundational persistence portions of plan Sections 5 and 5.2 after reviewing the applicable model responsibilities, relationships, constraints and lookup needs. Keep policy-dependent additions in their feature tasks.
- **Dependencies:** DEV-003–DEV-004; review of applicable DEC-003–DEC-010 and DEC-013 before encoding their decisions; DEC-018 before production data initialization.
- **Acceptance Criteria:** Foundational Prisma changes and migrations are reviewed and reproducible in an isolated database; query and constraint review is attached. Unresolved production data continuity is recorded separately. Constitutional Database Rules and plan VAL-015 are traceable to the applicable checks.

#### [x] DEV-007 — Implement baseline request-access and session safeguards

- **Service / Module:** Backend auth, session and authorization services; common guards and decorators.
- **Objective:** Implement the shared enforcement primitives required by plan Sections 4.2–4.3 and 6.6, including session lookup/revocation support and separate authentication/authorization checks. Source: FR-011, FR-042; SEC-001–SEC-003, SEC-009, SEC-012.
- **Dependencies:** DEV-004–DEV-006; reviewed DEC-008–DEC-009 for real token/session behavior; controlled permission fixtures until DEC-013–DEC-014 are resolved.
- **Acceptance Criteria:** Applicable VAL-007 and VAL-010–VAL-012 foundation cases pass. Guard adoption and public-operation inventory are reviewed. Fixture-only verification is explicitly labeled; production issuance is not accepted by this task.

#### [x] DEV-008 — Establish mobile transport, storage and navigation foundations

- **Service / Module:** Mobile API/config/storage libraries, providers, route entry and feedback components.
- **Objective:** Implement centralized typed transport, credential-store access and reusable navigation/feedback integration following plan Section 7.2. Prepare launch handling for later backend-confirmed account/session outcomes.
- **Dependencies:** DEV-003–DEV-005; DEV-002 storage/navigation selection; applicable DEC-015 decisions.
- **Acceptance Criteria:** Transport, storage-access and route-boundary component tests pass against isolated responses. Review maps the implementation to FR-044, NFR-001, NFR-005–NFR-007 and applicable VAL-013. No completed sign-in or restoration journey is claimed yet.

#### [x] DEV-009 — Establish deterministic test infrastructure

- **Service / Module:** Backend Jest/Supertest setup, isolated PostgreSQL fixtures and mobile Jest/RNTL setup.
- **Objective:** Prepare repeatable clocks, fixture builders, injectable provider substitutes, database cleanup and check commands according to plan Section 10.1 and constitutional Testing Rules.
- **Dependencies:** DEV-003, DEV-006, DEV-008.
- **Acceptance Criteria:** Test suites run reproducibly from documented setup; isolation checks distinguish fixture adapters from real application providers. A traceability template records task, requirement, VAL case, configuration, command, outcome and evidence location.

Foundation execution evidence (2026-10-13): DEV-003 through DEV-009 are implemented and verified as recorded in [foundation-validation.md](docs/foundation-validation.md), including task/source/VAL mapping, commands and findings. IT-001 and IT-002 foundation cases pass; the owner accepted IT-003 with listed release-remediation gates retained. Fixture evidence does not activate production authentication or close a later story.

### 3.2 DEL-002 — Supporting account establishment

#### [x] DEV-010 — Close account-establishment prerequisites

- **Execution evidence (2026-10-13):** IT-003 and R2-A/R2-B/R2-C explicitly accepted by the owner. Latest age/email directions and reviewed OTP, registration abuse/privacy/retention and technical contracts are in [approved account readiness R2](docs/account-readiness.md). DEV-010 implementation entry is complete. Live provider/platform results and production history/initialization remain separate gates; dependent work follows task order.

- **Service / Module:** Account policy and provider readiness register.
- **Objective:** Obtain and record the decisions required by DEL-002 entry, including the constitutional resolution referenced by CLR-024. Source: DEC-003–DEC-007, DEC-012 and applicable DEC-016/DEC-018; CLR-002–CLR-005, CLR-021, CLR-023–CLR-024.
- **Dependencies:** IT-003; DEV-001 register.
- **Acceptance Criteria:** Each required onboarding/contact/email/Twilio decision has attributable review evidence and an affected-task mapping. CLR-024 has a recorded governance resolution before DEV-013 begins. Missing decisions leave dependent tasks blocked; this task does not itself amend source documents.

#### [x] DEV-011 — Implement account and verification persistence changes

- **Execution evidence (2026-10-13):** [Account persistence review](docs/account-persistence.md), Prisma migration `202610130002_account`, 10 passing isolated PostgreSQL cases across the foundation/account suites, and passing backend lint/type/unit/build checks. Verified-contact uniqueness, active-account prerequisites, context/purpose binding and concurrent challenge claims are enforced. Production target/history/provider activation remains gated.

- **Service / Module:** Prisma migrations; identity/auth data-access services.
- **Objective:** Implement the reviewed account, contact and verification persistence portions of plan Section 5 needed by DEL-002. Source: ENT-002–ENT-005 as applicable; FR-001, FR-008, FR-047–FR-052.
- **Dependencies:** DEV-010, DEV-006.
- **Acceptance Criteria:** Feature migration review and isolated database checks cover the applicable constraints and local transitions. Persistence access remains in the approved service layers; evidence is linked to VAL-001, VAL-015–VAL-016 and VAL-018.

#### [x] DEV-012 — Implement canonical identity lookup and contact handling

- **Execution evidence (2026-10-13):** Metadata-based India phone normalization, canonical email/name/provider-subject handling, trusted verified-method lookup and transactional identity claims implemented. Database suites pass 14 cases, including concurrent same-context completion, competing contact claims, rollback and rejection of unverified/mismatched proof. No assisted account merge or contact-replacement bypass is implemented.

- **Service / Module:** Backend identity services and normalization utilities.
- **Objective:** Implement the shared identity-resolution and contact-handling work in plan Section 6.1 for account establishment and later sign-in reuse. Source: FR-007–FR-008, FR-051; BR-001–BR-003, BR-011.
- **Dependencies:** DEV-011; resolved DEC-003–DEC-004.
- **Acceptance Criteria:** Service tests reference US-001/US-003 and applicable EC-004, EC-048, EC-051 cases. Concurrent lookup/create evidence is available for IT-004; unresolved assisted-resolution behavior is not implemented by inference.

#### [ ] DEV-013 — Implement the approved Twilio verification adapter

- **Service / Module:** Backend auth providers and verification services.
- **Objective:** Implement the provider adapter, bound verification operations and application abuse-control integration specified by plan Sections 6.3, 7.4 and 8.1. Source: FR-005, FR-047; SEC-005, SEC-007; INT-003.
- **Dependencies:** DEV-010–DEV-012; CLR-024 resolved; DEC-006–DEC-007 configuration and recovery decisions recorded.
- **Acceptance Criteria:** Adapter and local-transition tests cover applicable VAL-004 and VAL-018 cases. Reviewed provider configuration and test evidence distinguish adapter-substitute results from isolated Twilio results. Applicable constitutional compliance is demonstrable against the recorded CLR-024 resolution.

#### [ ] DEV-014 — Implement registration-email verification

- **Service / Module:** Backend auth/email providers and authorization persistence.
- **Objective:** Implement the registration-email lifecycle and delivery integration described in plan Section 6.1 using the reviewed policy and vendor selection. Source: FR-048–FR-049; BR-009; CLR-002 and CLR-004.
- **Dependencies:** DEV-010–DEV-012; DEC-012 registration-email decisions and provider readiness.
- **Acceptance Criteria:** Unit and adapter tests cover the approved registration-email lifecycle, including purpose and concurrency checks selected for IT-005. The implementation and its configuration are reviewed separately from password-recovery authorization.

#### [ ] DEV-015 — Implement account-establishment orchestration

- **Service / Module:** Backend auth/identity application services and pending-context enforcement.
- **Objective:** Connect identity, verification and the approved minimal profile operations according to plan Section 6.1. Source: US-001 supporting slice; FR-001–FR-002 within scope, FR-043, FR-047–FR-052; BR-008–BR-011.
- **Dependencies:** DEV-007, DEV-012–DEV-014.
- **Acceptance Criteria:** Service-level evidence maps each included US-001 scenario to the approved field/verification decisions and VAL-001/VAL-016. The DEL-002 primary-authentication fixture boundary is documented for replacement in DEL-003.

#### [ ] DEV-016 — Expose and document account-establishment operations

- **Service / Module:** Backend auth DTOs/controllers; Swagger/OpenAPI.
- **Objective:** Connect the DEL-002 services through the corresponding operation groups in plan Section 7.1, using shared validation, access checks and safe responses.
- **Dependencies:** DEV-005, DEV-015.
- **Acceptance Criteria:** Request/response and error behavior is covered by API tests; generated OpenAPI matches the implemented operations and security context. Review links FR-043–FR-044, SEC-001–SEC-003 and VAL-001/VAL-012/VAL-016 to their tests.

#### [ ] DEV-017 — Integrate registration and verification interactions

- **Service / Module:** Mobile register/verify-phone/verify-email routes; auth services, schemas, hooks and components.
- **Objective:** Integrate DEV-016 into the approved account-establishment interactions and launch routing. Source: plan Sections 7.2–7.3; US-001 bounded scenarios; FR-044; NFR-001, NFR-006–NFR-007.
- **Dependencies:** DEV-008, DEV-016; relevant DEV-010 decisions.
- **Acceptance Criteria:** RNTL tests reference the applicable US-001 and shared Section 2.1 scenarios. Compatible Expo Go evidence is captured; fixture-backed primary identity is clearly labeled until DEL-003. Required interaction/error states are traced to their source cases.

### 3.3 DEL-003 — Authentication across the selected matrix

#### [ ] DEV-018 — Close authentication-method activation prerequisites

- **Service / Module:** Method configuration, security review and provider/mobile setup records.
- **Objective:** Record the first method to implement and the remaining within-story method order; close each method's prerequisites from DEL-003 entry. Source: DEC-002, DEC-005–DEC-011, DEC-015; CLR-003–CLR-004 and CLR-020.
- **Dependencies:** IT-007.
- **Acceptance Criteria:** Each selected method/platform combination has a configuration owner and validation environment; credential, issuance and abuse-control decisions needed for member authentication are reviewed. Privileged-method decisions still awaiting DEL-006 remain explicitly gated.

#### [ ] DEV-019 — Implement password credentials and authentication

- **Service / Module:** Backend auth DTOs, credential services and reviewed persistence additions.
- **Objective:** Implement password credential establishment and authentication under plan Section 6.2, connecting registration to the real primary method. Source: FR-004, FR-048, FR-050; SEC-004, SEC-007; BR-012.
- **Dependencies:** DEV-018, DEV-012, DEV-015; DEC-005 and applicable DEC-007 resolved.
- **Acceptance Criteria:** Reviewed credential migrations, if needed, precede persistence use. Unit tests and applicable VAL-003/VAL-017 evidence use the approved credential policy and hashing parameters. Credential handling review is recorded.

#### [ ] DEV-020 — Implement phone OTP sign-in orchestration

- **Service / Module:** Backend auth and identity services.
- **Objective:** Reuse the DEL-002 verification integration for the sign-in purpose according to plan Section 6.3. Source: FR-003, FR-005, FR-007; BR-004; SEC-005, SEC-007; INT-003.
- **Dependencies:** DEV-018, DEV-013, DEV-015.
- **Acceptance Criteria:** Sign-in service tests map to VAL-002, VAL-004, VAL-016 and VAL-018. Evidence distinguishes sign-in integration from the earlier registration-verification coverage.

#### [ ] DEV-021 — Implement Google identity verification

- **Service / Module:** Backend auth Google provider and identity integration.
- **Objective:** Implement the Google verification and flow-binding work in plan Section 6.4 using reviewed platform configuration. Source: FR-006–FR-009; SEC-008; INT-001.
- **Dependencies:** DEV-018, DEV-012, DEV-015; applicable DEC-011 resolved.
- **Acceptance Criteria:** Adapter/service tests cover the Google subset of VAL-005 and method-gating cases in VAL-002. Trusted configuration and the real-device evidence prerequisites are recorded without embedding credentials in documentation.

#### [ ] DEV-022 — Implement Apple identity verification

- **Service / Module:** Backend auth Apple provider and identity integration.
- **Objective:** Implement the Apple verification and identity-handling work in plan Section 6.4 using reviewed iOS configuration. Source: FR-006–FR-009; SEC-008; INT-002; EC-011.
- **Dependencies:** DEV-018, DEV-012, DEV-015; applicable DEC-011 resolved.
- **Acceptance Criteria:** Adapter/service tests cover the Apple subset of VAL-005 and VAL-002. The platform scope is traceable to CLR-003; no additional Android Apple implementation is inferred.

#### [ ] DEV-023 — Integrate initial session establishment and token issuance

- **Service / Module:** Backend session/token services and auth orchestration.
- **Objective:** Connect verified primary-method results to the reviewed session issuance and request-validation primitives in plan Section 6.6. Source: FR-003–FR-007, FR-011, FR-042; SEC-001, SEC-009.
- **Dependencies:** DEV-007, DEV-015, DEV-018; the relevant method task among DEV-019–DEV-022 for each integration; DEC-008–DEC-009 issuance decisions resolved.
- **Acceptance Criteria:** All DEV-019–DEV-022 method results eventually use the reviewed common issuance path. Applicable VAL-007/VAL-016 tests pass, with database and key-handling review attached. Broader session-continuity acceptance remains in DEL-005.

#### [ ] DEV-024 — Integrate authentication API operations and current context

- **Service / Module:** Backend auth controllers/DTOs; session context; OpenAPI.
- **Objective:** Expose the selected authentication operations and safe current-context operation from plan Section 7.1; integrate per-operation abuse controls and method activation.
- **Dependencies:** DEV-019–DEV-023; DEV-005.
- **Acceptance Criteria:** API tests and OpenAPI cover every selected member method and relevant activation condition. The operation inventory maps to FR-003–FR-008, FR-043–FR-044 and applicable VAL-002–VAL-005/VAL-007/VAL-012.

#### [ ] DEV-025 — Integrate mobile sign-in and real primary-method registration

- **Service / Module:** Mobile sign-in, registration entry, provider hooks and authenticated route boundary.
- **Objective:** Integrate all selected methods with DEV-024 and replace DEL-002 primary-authentication fixtures in real mobile journeys. Apply plan Sections 7.2–7.3 and the approved provider callback configuration.
- **Dependencies:** DEV-017, DEV-024; DEV-018 provider/build prerequisites.
- **Acceptance Criteria:** Source-linked RNTL tests pass for US-002 and the reconnected US-001 slice. Method/platform coverage is recorded for IT-010, including required development builds; the complete selected method matrix remains an exit obligation.

### 3.4 DEL-004 — Secure identity association

#### [ ] DEV-026 — Close association and conflict-resolution prerequisites

- **Service / Module:** Identity/security policy register.
- **Objective:** Resolve DEL-004 entry decisions for proof, recency and visible conflict handling; identify any separately approved assisted-resolution scope. Source: DEC-004, DEC-011, applicable DEC-016/DEC-018; CLR-005, CLR-017, CLR-021 and CLR-023.
- **Dependencies:** IT-011.
- **Acceptance Criteria:** Required evidence and recovery/conflict decisions have attributable approval records and test mappings. Any unresolved assisted-operation scope is explicitly blocked and is not replaced with assumed staff powers.

#### [ ] DEV-027 — Implement association proof and persistence support

- **Service / Module:** Backend auth/identity services and Prisma changes where required.
- **Objective:** Implement the reviewed association-context and persistence support in plan Sections 5.1 and 6.5. Source: FR-007–FR-009, FR-051; BR-001–BR-003, BR-011.
- **Dependencies:** DEV-026; DEV-011–DEV-012 and DEV-019–DEV-022.
- **Acceptance Criteria:** Necessary migrations are reviewed before use; unit and database tests cover the proof/context portions of VAL-006. The implementation reuses approved provider verification rather than duplicating verification logic.

#### [ ] DEV-028 — Implement association orchestration and API integration

- **Service / Module:** Backend identity/auth services, DTOs/controllers and OpenAPI.
- **Objective:** Complete secure method-association operations and approved conflict outcomes under plan Section 6.5. Source: US-003; FR-007–FR-009; SEC-008.
- **Dependencies:** DEV-027; DEV-024 shared API integration.
- **Acceptance Criteria:** Service/API evidence covers the applicable US-003 scenarios and VAL-006; OpenAPI documents actual security and error behavior. Database concurrency checks are assigned to IT-012.

#### [ ] DEV-029 — Integrate member association and conflict interactions

- **Service / Module:** Mobile auth association components/hooks/services and feedback.
- **Objective:** Connect DEV-028 to the reviewed reauthentication, new-method and conflict interactions. Source: plan Sections 6.5 and 7.2; FR-044; EC-004, EC-010–EC-011, EC-039–EC-040.
- **Dependencies:** DEV-025, DEV-028.
- **Acceptance Criteria:** RNTL tests link to the US-003 scenarios and applicable VAL-006/VAL-013 cases; agreed interrupted/conflict outcomes are demonstrated. No additional account-management screen scope is inferred.

#### [ ] DEV-030 — Implement assisted association resolution only if approved

- **Service / Module:** Backend identity/authorization and audit integration; approved operational procedure.
- **Objective:** Implement only the assisted-resolution subset expressly enabled under DEV-026, using plan DEL-004 and Sections 6.5/8.2. Source: CLR-005, CLR-017, CLR-021.
- **Dependencies:** DEV-026, DEV-028; explicit authority, identity-check and audit-policy approval for this operation.
- **Acceptance Criteria:** If enabled, API/service and audit evidence demonstrates the approved scope under VAL-006/VAL-011–VAL-012. Otherwise record an explicit approved exclusion and its safe visible outcome; an unresolved decision does not count as completion. No general administration product is included.

### 3.5 DEL-005 — Sessions, logout and eligible recovery

#### [ ] DEV-031 — Close session and recovery prerequisites

- **Service / Module:** Session/security policy and recovery readiness register.
- **Objective:** Resolve DEL-005 entry decisions, including the conditional logout-all disposition. Source: DEC-008–DEC-010, DEC-012 and applicable DEC-015–DEC-017; CLR-004–CLR-005.
- **Dependencies:** IT-014.
- **Acceptance Criteria:** The register contains reviewed session, rotation, concurrency, recovery, key and storage decisions required by DEV-032–DEV-039. Every essential VAL-007–VAL-009/VAL-017/VAL-019 case has an approved parameter/outcome source.

#### [ ] DEV-032 — Implement session-continuity persistence changes

- **Service / Module:** Backend sessions/auth data access and Prisma migrations.
- **Objective:** Implement the remaining reviewed session, refresh and recovery persistence work from plan Sections 5–5.2 and 6.6–6.7.
- **Dependencies:** DEV-031; DEV-006, DEV-011, DEV-023.
- **Acceptance Criteria:** Migrations and state-transition operations are reviewed and tested in isolated PostgreSQL. Evidence covers applicable VAL-015/VAL-019 invariants and compatibility with existing account/session fixtures.

#### [ ] DEV-033 — Implement rotating refresh and session-policy enforcement

- **Service / Module:** Backend session services, DTOs/controllers and OpenAPI.
- **Objective:** Implement renewal and session-policy behavior from plan Section 6.6, including the reviewed race/replay decisions. Source: FR-011, FR-053; SEC-009; EC-050.
- **Dependencies:** DEV-032; DEV-031 decisions.
- **Acceptance Criteria:** Unit/API tests map to VAL-007, VAL-009 and VAL-019; the documented operation matches the actual implementation. Concurrent PostgreSQL verification is included in IT-015.

#### [ ] DEV-034 — Implement logout and security-event revocation

- **Service / Module:** Backend session/auth services and API operations.
- **Objective:** Complete current-session logout and the approved security-event invalidation effects from plan Section 6.6. Source: FR-010–FR-011; BR-006; SEC-009; EC-008, EC-013.
- **Dependencies:** DEV-032–DEV-033; DEV-031 revocation decisions.
- **Acceptance Criteria:** Service/API evidence maps to VAL-007–VAL-009/VAL-019. Operation documentation includes the reviewed completion and interrupted-request outcomes; race coverage is assigned to IT-015.

#### [ ] DEV-035 — Implement logout-all only after its policy gate

- **Service / Module:** Backend session services/API; mobile auth controls.
- **Objective:** Implement the conditional action identified in plan Section 6.6 and DEL-005. Source: FR-054; CLR-004.
- **Dependencies:** DEV-031, DEV-034; explicit UX, authority and revocation-policy approval.
- **Acceptance Criteria:** If enabled, backend/mobile evidence passes the applicable VAL-008/VAL-019 cases. Otherwise retain an explicitly approved deferred disposition in the scope register. An unresolved policy blocks the affected acceptance claim.

#### [ ] DEV-036 — Implement password-recovery request and delivery

- **Service / Module:** Backend auth recovery services, email provider, DTOs and OpenAPI.
- **Objective:** Implement the request, authorization issuance and delivery work in plan Section 6.7 using the reviewed email configuration. Source: FR-012; BR-005; SEC-006–SEC-007; INT-006.
- **Dependencies:** DEV-014, DEV-031–DEV-032; DEC-012 recovery configuration approved.
- **Acceptance Criteria:** Unit/adapter/API evidence maps to VAL-009/VAL-012/VAL-017. Recovery operation documentation and approved delivery-failure handling are synchronized with implementation.

#### [ ] DEV-037 — Implement password-reset completion and session effects

- **Service / Module:** Backend auth credential/recovery and session services.
- **Objective:** Implement reset completion and the reviewed credential/session transition described in plan Section 6.7. Source: FR-012, FR-050; BR-005, BR-012; SEC-004, SEC-006, SEC-009.
- **Dependencies:** DEV-019, DEV-034, DEV-036; DEV-031 reset-session decision.
- **Acceptance Criteria:** Unit/API tests cover the applicable VAL-009/VAL-017 cases; transaction review and concurrent-completion evidence are available for IT-016. OpenAPI matches the completed reset operation.

#### [ ] DEV-038 — Integrate mobile renewal, restoration and credential lifecycle

- **Service / Module:** Mobile storage/API libraries, auth providers/hooks and launch routing.
- **Objective:** Implement durable session handling and coordinated renewal under plan Sections 6.6 and 7.2–7.3. Source: FR-053; SEC-009; NFR-004–NFR-007.
- **Dependencies:** DEV-025, DEV-033–DEV-034; DEV-031/DEC-015 storage decisions.
- **Acceptance Criteria:** Source-linked RNTL tests cover VAL-013/VAL-019; storage lifecycle evidence is prepared for IT-017/IT-018. Backend integration is used for real restoration; fixture results are labeled separately.

#### [ ] DEV-039 — Integrate mobile logout and password recovery

- **Service / Module:** Mobile forgot-password/reset-password routes; auth session controls and feedback.
- **Objective:** Integrate DEV-034, applicable DEV-035 and DEV-036–DEV-037 into the mobile journeys described by plan Section 7.2. Source: US-004; FR-044; NFR-001, NFR-004, NFR-006–NFR-007.
- **Dependencies:** DEV-037–DEV-038; DEV-035 disposition recorded.
- **Acceptance Criteria:** RNTL tests map to US-004 and VAL-008–VAL-009/VAL-013/VAL-017/VAL-019. Reviewed deep-link and interrupted-outcome behavior is included; required platform evidence is assigned to IT-018.

### 3.6 DEL-006 — Actual role and ownership coverage

#### [ ] DEV-040 — Close real permission and provisioning prerequisites

- **Service / Module:** Authorization/security policy register.
- **Objective:** Obtain the action/subject grants, method access, bootstrap/provisioning authority and change-propagation decisions required by DEL-006. Source: DEC-002, DEC-009, DEC-013–DEC-016; CLR-006, CLR-017 and CLR-021.
- **Dependencies:** IT-019.
- **Acceptance Criteria:** The reviewed matrix covers every in-scope protected operation and actual role. Authority, audit and propagation decisions are attributable; absent grants remain unresolved rather than being invented from a role label.

#### [ ] DEV-041 — Implement trusted role assignments and controlled provisioning

- **Service / Module:** Backend authorization/identity services; Prisma changes; approved provisioning mechanism.
- **Objective:** Implement the reviewed role-assignment and provisioning work in plan Sections 4.3 and 8.2. Source: FR-052; SEC-003; CLR-017.
- **Dependencies:** DEV-040; DEV-007, DEV-011.
- **Acceptance Criteria:** Reviewed migrations and service/provisioning tests are linked to VAL-010/VAL-012/VAL-016. Audit evidence and the provisioning procedure are reviewable; no unrelated role editor or management UI is added.

#### [ ] DEV-042 — Apply the approved action and role policies

- **Service / Module:** Backend authorization guards/policies; all in-scope protected controllers/services.
- **Objective:** Replace foundation-only permission fixtures in real paths with the approved matrix, including privileged-method restrictions. Source: plan Section 4.3; FR-042; BR-007; SEC-001–SEC-003, SEC-012.
- **Dependencies:** DEV-041; DEV-024, DEV-028, DEV-033–DEV-037 as applicable.
- **Acceptance Criteria:** Every protected operation appears in the policy inventory and source-linked test matrix. Applicable VAL-002 and VAL-010–VAL-011 tests pass; OpenAPI reflects the actual security behavior.

#### [ ] DEV-043 — Complete ownership, collection and concurrent-change enforcement

- **Service / Module:** Backend authorization policies and affected data-access/application services.
- **Objective:** Apply the subject-level and concurrency work in plan Section 4.3 to in-scope operations and controlled consumer fixtures. Source: FR-042, applicable FR-046; SEC-002–SEC-003; EC-012, EC-017, EC-041.
- **Dependencies:** DEV-040, DEV-042; approved DEC-014 and change/race decisions.
- **Acceptance Criteria:** Individual, collection and mutation evidence maps to VAL-010–VAL-011. Review documents the integration obligations for future business modules without implementing those modules.

#### [ ] DEV-044 — Integrate current authority and denied-access feedback on mobile

- **Service / Module:** Mobile auth provider, centralized API client and protected navigation.
- **Objective:** Connect current context and authorization responses to the existing mobile interactions under plan Section 7.2. Source: US-017; FR-044; NFR-001, NFR-005.
- **Dependencies:** DEV-038–DEV-039, DEV-042–DEV-043.
- **Acceptance Criteria:** RNTL evidence maps to applicable VAL-010/VAL-013 and shared platform cases. Review confirms that the task adds only access feedback and routing needed by the selected slice.

#### [ ] DEV-045 — Complete protected-operation inventory and consumer guidance

- **Service / Module:** Backend OpenAPI, module integration guidance and security review records.
- **Objective:** Reconcile all implemented operation paths, public exceptions, policies and ownership enforcement with plan DEL-006 and Section 11.1.
- **Dependencies:** DEV-041–DEV-044; DEV-030 disposition and implementation evidence where enabled.
- **Acceptance Criteria:** The inventory links every real operation to its DTO, access policy, source reference and executable test. Consumer guidance identifies enforcement responsibilities for future modules; IT-020 can audit coverage without relying on UI visibility.

### 3.7 DEL-007 — Integrated validation preparation and handoff

#### [ ] DEV-046 — Prepare operational and configuration verification records

- **Service / Module:** Backend/mobile setup guidance; security, provider and migration operations.
- **Objective:** Assemble the operational evidence required by plan Sections 8, 10.3 and 11.1, including configuration, keys, provider failures, migrations and approved privacy/continuity decisions.
- **Dependencies:** IT-022; applicable DEC-006–DEC-018 decisions needed for the selected acceptance environment.
- **Acceptance Criteria:** Reviewable records identify environment/build versions, required settings, key/recovery procedures, provider ownership and migration repair/compatibility approach. DEC-016–DEC-018 dispositions are explicit; any separately required import or production-policy work is recorded as a readiness dependency, not silently added to this slice.

#### [ ] DEV-047 — Prepare the integrated acceptance run

- **Service / Module:** Test fixtures, traceability and quality measurement configuration.
- **Objective:** Freeze the candidate revision, approved policy configuration, device/provider matrix and evidence collection procedure for DEL-007. Source: plan Sections 10–11; SC-001, SC-010, applicable SC-011, SC-012–SC-013.
- **Dependencies:** IT-022; DEC-015 and DEC-017 acceptance decisions; all critical decision gates affecting the run closed.
- **Acceptance Criteria:** Every applicable VAL-001–VAL-019 case and selected story scenario is assigned an executable test or documented device/provider procedure. Approved measurement conditions and exclusions are recorded; provisional values remain distinguishable from acceptance inputs.

#### [ ] DEV-048 — Assemble the verification handoff

- **Service / Module:** Delivery evidence and implementation documentation.
- **Objective:** Compile the handoff records enumerated by plan Section 11.1 and reconcile the task register against the final integrated results.
- **Dependencies:** DEV-046–DEV-047; IT-023–IT-026.
- **Acceptance Criteria:** The handoff links the candidate revision, task dispositions, source/test matrix, actual configurations, migration/OpenAPI records, build/device/provider evidence and remaining limitations. Failed evidence is not presented as completion. Required outstanding work remains a blocker to IT-027.

## 4. Integration & Testing Tasks

Execute these tasks within their corresponding phase. Each task uses the specification's referenced scenarios and outcomes, with the plan's VAL cases as the execution catalog. Unit tests belong to the development tasks; these tasks verify integration, cross-layer behavior and phase acceptance.

For each result, record candidate revision, task/requirement/VAL IDs, approved configuration, controlled starting data, test command or manual procedure, platform/build, actual result and evidence location. Record failed, blocked and not-applicable cases explicitly. Conditional exclusions require a recorded approved disposition.

### 4.1 DEL-001 — Foundation integration and exit

| Task ID | Title | Service / Module | Objective | Dependencies | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- |
| IT-001 | Validate shared security and error integration | Backend configuration, validation, logging and guards | Exercise the foundational portions of VAL-007 and VAL-010–VAL-012 through real request paths; source SEC-001–SEC-003 and SEC-010–SEC-012. | DEV-004–DEV-005, DEV-007, DEV-009 | Source-linked success, rejection and exception cases pass; redaction captures and configuration-activation evidence are attached. |
| IT-002 | Validate persistence and mobile foundation boundaries | Isolated PostgreSQL; mobile transport/storage/routes | Exercise foundation portions of VAL-013/VAL-015 and constitutional Database, Frontend and Testing Rules. | DEV-006, DEV-008–DEV-009 | Migration/setup checks and isolated mobile interaction tests pass reproducibly; fixture-only evidence is labeled. |
| IT-003 | Close DEL-001 | All foundation modules | Apply plan DEL-001 exit and Section 10.4 to DEV-001–DEV-009. | DEV-001–DEV-009, IT-001–IT-002 | Required checks/builds and applicable foundation reviews pass; activation gates are visible, evidence is linked and the phase exit is recorded. No story completion is claimed. |

### 4.2 DEL-002 — Account establishment integration and exit

| Task ID | Title | Service / Module | Objective | Dependencies | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- |
| IT-004 | Validate account and input boundaries | Identity/auth services, APIs and PostgreSQL | Execute VAL-001/VAL-016 against US-001's bounded scenarios and EC-001–EC-004, EC-047–EC-048, EC-051; include approved boundary data and concurrent identity operations. | DEV-011–DEV-012, DEV-015–DEV-016, DEV-009 | API and database evidence passes the referenced cases against approved field/contact decisions; fixture identity scope is documented. |
| IT-005 | Validate verification and partial-failure integration | Twilio/email adapters, auth services and PostgreSQL | Execute applicable VAL-004/VAL-012/VAL-018 and registration-email cases; source FR-047–FR-049, INT-003, EC-039–EC-042 and EC-049. Include remote/local failure boundaries. | DEV-013–DEV-016; resolved CLR-024 and provider configuration | Isolated provider and deterministic fault-injection results are separately recorded and pass the referenced cases; actual provider resend/expiry behavior is evidenced. |
| IT-006 | Validate registration workflow and mobile interactions | Mobile routes and backend account operations | Exercise the US-001 supporting workflow and shared specification Section 2.1 scenarios, including API-driven navigation/state changes and applicable VAL-013/VAL-014. | DEV-017, IT-004–IT-005 | RNTL and applicable Android/iOS interaction evidence passes; controlled primary-authentication substitutions are documented for revalidation in DEL-003. |
| IT-007 | Close DEL-002 | Account-establishment slice | Apply plan DEL-002 exit and Section 10.4; rerun affected foundation regression. | DEV-010–DEV-017, IT-004–IT-006 | VAL-001/VAL-016 and applicable VAL-004/VAL-012/VAL-018 pass; required checks/builds/reviews pass. Bounded US-001 completion is recorded with full-profile scope excluded. |

### 4.3 DEL-003 — Authentication integration and exit

| Task ID | Title | Service / Module | Objective | Dependencies | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- |
| IT-008 | Validate password and OTP authentication paths | Auth/identity/session APIs and providers | Execute relevant VAL-002–VAL-004, VAL-007, VAL-012 and VAL-016–VAL-018; source US-002, EC-005–EC-008 and EC-047–EC-049. Include happy, negative, validation and approved rate boundaries. | DEV-019–DEV-020, DEV-023–DEV-024 | Source-linked API/provider results pass for both methods; completed registration is exercised through real method integration. |
| IT-009 | Validate Google/Apple and canonical identity integration | Provider adapters, auth, identity and sessions | Execute VAL-002/VAL-005/VAL-007 and relevant VAL-012/VAL-016; source US-002–US-003, INT-001–INT-002, EC-005 and EC-010–EC-011. Include token/flow boundary and concurrent repeat-sign-in cases. | DEV-021–DEV-024 | Backend verification and identity/database evidence passes the referenced cases; real-provider evidence is distinguished from cryptographic/adapter fixtures. |
| IT-010 | Validate the complete mobile method/platform matrix | Mobile provider flows, backend APIs, Expo/EAS builds | Execute US-002 and shared Section 2.1 journeys plus VAL-013/VAL-014; replace DEL-002 fixture evidence for selected primary methods. | DEV-025, IT-008–IT-009; DEC-011/DEC-015 setup ready | All selected combinations have passing backend-connected evidence; compatible Expo Go work and required native/OAuth development builds are recorded, with separate Android and iOS results. |
| IT-011 | Close DEL-003 | Authentication slice | Apply plan DEL-003 exit and Section 10.4; rerun registration and shared-security regression. | DEV-018–DEV-025, IT-008–IT-010 | VAL-002–VAL-005/VAL-007 and applicable VAL-012–VAL-014/VAL-016–VAL-018 pass for the selected matrix; required checks/builds/reviews pass before US-003 begins. |

### 4.4 DEL-004 — Association integration and exit

| Task ID | Title | Service / Module | Objective | Dependencies | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- |
| IT-012 | Validate association proof, concurrency and ownership continuity | Identity/auth APIs and PostgreSQL | Execute VAL-006 and applicable VAL-001/VAL-005/VAL-011/VAL-016; source US-003, EC-004, EC-010–EC-011 and EC-048. Use controlled ownership records from outside the slice where necessary. | DEV-027–DEV-028; DEV-030 if enabled | Source-linked identity, proof-boundary and competing-request cases pass with persisted-state evidence. Conditional assisted-resolution tests match only their approved scope. |
| IT-013 | Validate association interaction, recovery and diagnostics | Mobile association flows; backend errors/logs | Execute applicable VAL-006/VAL-012/VAL-013 across the reviewed US-003 workflow and interruption cases EC-039–EC-040. | DEV-029, IT-012 | Backend-connected interaction and synthetic-secret diagnostic evidence passes; applicable Section 2.1 platform checks are attached. |
| IT-014 | Close DEL-004 | Identity association slice | Apply plan DEL-004 exit and Section 10.4; rerun affected authentication/account regression. | DEV-026–DEV-029; DEV-030 completed or explicitly excluded; IT-012–IT-013 | VAL-006 and relevant VAL-001/VAL-005/VAL-011–VAL-012/VAL-016 pass; required checks/builds/reviews pass and the conflict-outcome decision is recorded. |

### 4.5 DEL-005 — Session and recovery integration and exit

| Task ID | Title | Service / Module | Objective | Dependencies | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- |
| IT-015 | Validate session transitions and concurrency | Session/auth APIs and PostgreSQL | Execute VAL-007–VAL-009/VAL-015/VAL-019 for the approved session/refresh/logout transitions; source US-004, EC-008, EC-013, EC-039–EC-042 and EC-050. Include key/clock boundaries and overlapping requests. | DEV-032–DEV-034; DEV-035 if enabled | Controlled-clock, concurrent-database and interrupted-response evidence passes against DEC-008–DEC-010 decisions; the applicable logout-all disposition is reflected in coverage. |
| IT-016 | Validate recovery boundaries and credential transitions | Recovery/email/credential/session integration | Execute recovery portions of VAL-009/VAL-012/VAL-017, including approved input/time boundaries and parallel request/completion cases; source FR-012, FR-050, BR-005, BR-012, INT-006 and EC-009. | DEV-036–DEV-037 | Referenced unit/API/provider/database cases pass with approved session-effect evidence and synthetic-secret output review. |
| IT-017 | Validate mobile startup and session state transitions | Mobile entry/routes, storage and API/session integration | Execute VAL-013/VAL-019 against US-004's continuity scenarios and FR-044; exercise restoration, renewal, logout and failure transitions defined in plan Section 7.2. | DEV-038–DEV-039, IT-015–IT-016 | RNTL and backend-connected workflow evidence passes, including storage and concurrent-client request handling. Startup routing is tied to the reviewed account/session context. |
| IT-018 | Validate session/recovery behavior on devices | Android/iOS builds, secure storage and reset callbacks | Execute relevant VAL-014 and specification Section 2.1 cases on the approved device/build matrix; include real lifecycle and callback behavior. | IT-017; DEC-015 matrix/build readiness | Passing results identify OS, build, storage and provider configuration; accessibility/interaction evidence covers both platforms and any gap remains an acceptance blocker. |
| IT-019 | Close DEL-005 | Session/logout/recovery slice | Apply plan DEL-005 exit and Section 10.4; rerun authentication and association regression. | DEV-031–DEV-039, with DEV-035 disposition recorded; IT-015–IT-018 | VAL-007–VAL-009/VAL-013/VAL-017/VAL-019 and applicable VAL-012/VAL-014–VAL-015 pass; required checks/builds/reviews pass and essential policy gaps are closed. |

### 4.6 DEL-006 — Authorization integration and exit

| Task ID | Title | Service / Module | Objective | Dependencies | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- |
| IT-020 | Validate every approved action and subject boundary | Backend protected APIs, guards/policies and provisioning | Execute VAL-010–VAL-012/VAL-016 and privileged-method VAL-002 using the DEV-045 inventory; source US-017 and bounded US-016, EC-012, EC-017, EC-041 and EC-044. Include direct API and missing-policy coverage. | DEV-040–DEV-045 | Every approved matrix cell and real protected path has a passing executable result or a justified, approved non-applicable disposition; database and audit evidence is attached. |
| IT-021 | Validate authority changes across session and mobile integration | Authorization/session services; mobile current context and navigation | Execute applicable VAL-007/VAL-010–VAL-011/VAL-013 against reviewed permission-change and in-flight semantics; source SEC-002–SEC-003, SEC-009 and FR-044. | IT-020; DEV-044 | Cross-layer and concurrent-change evidence passes under the approved policy, including applicable mobile interaction and diagnostic checks. |
| IT-022 | Close DEL-006 | Protected-access slice | Apply plan DEL-006 exit and Section 10.4; rerun previous story security regression. | DEV-040–DEV-045, IT-020–IT-021 | VAL-010–VAL-012/VAL-016 pass for the complete approved action matrix; required checks/builds/reviews pass and future-module integration guidance is attached. |

### 4.7 DEL-007 — Integrated regression and verification readiness

| Task ID | Title | Service / Module | Objective | Dependencies | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- |
| IT-023 | Execute full integrated story regression | Mobile, backend, isolated PostgreSQL and provider adapters | Run the selected US-001–US-004/US-017 journey set and bounded US-016 checks on the candidate revision, using all applicable VAL-001–VAL-019 cases. Include prior defect regression and cross-story state transitions. | DEV-046–DEV-047 | Repeatable evidence covers the complete in-scope source matrix; no required case is failed, silently skipped or substituted with unapproved policy fixtures. |
| IT-024 | Validate migrations, recovery and approved performance conditions | Database, backend runtime, providers and mobile transport | Execute VAL-015 and plan Section 8.3 fault scenarios under the approved DEC-017 conditions; review migrations, key/provider configuration, query behavior and operational recovery. | DEV-046–DEV-047; applicable DEC-016–DEC-018 decisions | Migration rehearsal, fault/recovery results and measured performance are attached and assessed against approved criteria. Local results are not presented as a measured production availability commitment. |
| IT-025 | Execute final platform/provider/accessibility matrix | Android/iOS devices/builds and isolated real providers | Revalidate VAL-014 and relevant VAL-005/VAL-013/VAL-018/VAL-019 on the candidate build; source Section 2.1, NFR-006–NFR-007 and SC-012. | IT-023; DEV-047 approved matrix | Every required platform/method/device case passes with reproducible build/configuration evidence; mock-only results are not used to close real-provider cases. |
| IT-026 | Complete security and constitutional compliance review | Entire implemented slice and delivery artifacts | Review plan Sections 10.3–10.4 against constitutional Governance and Development Workflow; verify final lint, type checks, backend/frontend suites, required builds, OpenAPI and secret/configuration checks. | IT-023–IT-025 | Review findings affecting required behavior are resolved and retested; check reports, database/performance review and constitutional compliance evidence are attached to the candidate revision. |
| IT-027 | Close DEL-007 and mark ready for independent verification | Verification handoff | Assess DEV-048 against Section 6 and plan Sections 10.4–11.1; reconcile SC-001, SC-010, applicable SC-011, SC-012–SC-013 evidence. | DEV-048; IT-003, IT-007, IT-011, IT-014, IT-019, IT-022, IT-023–IT-026 | All applicable completion conditions are met; the reviewer can reproduce the evidence from the handoff. Status may become ready for verification, without implying deployment, full-product completion or unrecorded client approval. |

## 5. Dependency Mapping

### 5.1 Mandatory phase sequence and critical path

The dependency-based critical path is:

`DEV-001 → DEL-001 / IT-003 → DEL-002 / IT-007 → DEL-003 / IT-011 → DEL-004 / IT-014 → DEL-005 / IT-019 → DEL-006 / IT-022 → DEL-007 / IT-027`.

This identifies mandatory sequencing, not a duration estimate. Task-level dependencies in Sections 3–4 are authoritative. A range in a Dependencies field requires every task in the range, except where an explicit conditional disposition is stated. References to a resolved DEC/CLR entry require its decision evidence, not just a matching register entry.

| Critical activity | Principal dependency chain | Consequence of an unresolved prerequisite |
| --- | --- | --- |
| Foundation enforcement and isolation | DEV-002–DEV-009 → IT-001–IT-003 | Account work cannot pass DEL-001 entry safeguards. |
| Account verification | DEV-010 → DEV-011–DEV-016 → DEV-017 → IT-004–IT-007 | US-002 cannot begin accepted implementation before the supporting account slice is validated. CLR-024 is an early blocking dependency. |
| Complete authentication matrix | DEV-018 → DEV-019–DEV-022 → DEV-023–DEV-025 → IT-008–IT-011 | A partial method/platform implementation cannot close US-002. |
| Verified association | DEV-026 → DEV-027–DEV-029 → IT-012–IT-014 | US-004 waits for accepted association behavior and the DEV-030 disposition. |
| Session and recovery integrity | DEV-031 → DEV-032 → DEV-033–DEV-039 → IT-015–IT-019 | Essential concurrency, session or recovery decisions block US-004 acceptance. |
| Real permission coverage | DEV-040 → DEV-041–DEV-045 → IT-020–IT-022 | Fixture-only role evidence cannot close US-017. |
| Integrated evidence and review | DEV-046–DEV-047 → IT-023–IT-026 → DEV-048 → IT-027 | Missing platform, provider, policy or compliance evidence blocks verification readiness. |

Branches in these chains join at their specified downstream task or phase exit; the table does not override the more precise task dependencies. Work within the active phase may proceed wherever its own prerequisites are met. Do not begin a later story to work around a blocked current-story exit.

### 5.2 Decision prerequisites and first affected tasks

This table maps existing decision identifiers to execution; it does not restate or resolve their policies.

| Plan decision | Specification reference | Resolution tracking task | First affected implementation / acceptance |
| --- | --- | --- | --- |
| DEC-001 | CLR-001; SRC-013 | DEV-001 | Scope for all tasks; IT-027 accepts only the bounded slice. |
| DEC-002 | CLR-003 | DEV-018; DEV-040 for privileged methods | DEV-019–DEV-025 and DEV-042; method matrix gates IT-011/IT-022. |
| DEC-003 | CLR-002 | DEV-010 | DEV-011–DEV-017; IT-007. |
| DEC-004 | CLR-005 | DEV-010; DEV-026 | DEV-012 and DEV-027–DEV-030; IT-007/IT-014. |
| DEC-005 | CLR-004 | DEV-018 | DEV-019 and DEV-037; IT-008/IT-016. |
| DEC-006 | CLR-004, CLR-024 | DEV-010 | DEV-013; IT-005/IT-007. Constitutional reconciliation precedes delegated OTP implementation. |
| DEC-007 | CLR-004, CLR-021 | DEV-010; DEV-018; DEV-031 where extended | DEV-013 and exposed credential operations; IT-005/IT-008/IT-016/IT-024. |
| DEC-008 | CLR-004 | DEV-001 for foundation review; DEV-018 and DEV-031 for activation/remaining decisions | DEV-007/DEV-023/DEV-033; IT-001/IT-008/IT-015. |
| DEC-009 | CLR-004 | DEV-001, DEV-018 and DEV-031 according to the behavior being enabled | DEV-007/DEV-023/DEV-034–DEV-035; IT-015/IT-019. |
| DEC-010 | CLR-004 | DEV-031 | DEV-032–DEV-033/DEV-038; IT-015/IT-017. |
| DEC-011 | CLR-003, CLR-020 | DEV-002; DEV-018; DEV-026 for association use | DEV-021–DEV-022/DEV-025/DEV-027; IT-009–IT-014. |
| DEC-012 | CLR-002, CLR-004–CLR-005 | DEV-010 for registration email; DEV-031 for recovery | DEV-014 and DEV-036–DEV-037; IT-005/IT-016. |
| DEC-013 | CLR-017 | DEV-001 for foundation defaults; DEV-040 for real grants | DEV-007 foundation; DEV-041–DEV-043 real privileges; IT-022. |
| DEC-014 | CLR-006, CLR-017 | DEV-040 | DEV-043; IT-020–IT-022. Earlier own-account safeguards remain mandatory. |
| DEC-015 | CLR-020 | DEV-002; phase-specific readiness checks; DEV-047 | DEV-008 and all mobile tasks; IT-006/IT-010/IT-018/IT-025. |
| DEC-016 | CLR-021 | DEV-001 and affected policy gates; DEV-046 | DEV-005/DEV-010/DEV-026/DEV-040 where data/audit policy is needed; IT-026. |
| DEC-017 | CLR-022 | Affected workflow gates; DEV-047 for measurement approval | Interrupted-flow tasks and IT-024; no invented operational thresholds. |
| DEC-018 | CLR-023 | DEV-010/DEV-026 where existing identities are affected; DEV-046 | Production initialization/migration readiness; IT-024/IT-027 where continuity is required. Isolated synthetic test databases do not resolve this decision. |

### 5.3 Cross-feature dependencies and revalidation

| Shared capability | Initial implementation | Dependent work | Required revalidation |
| --- | --- | --- | --- |
| Validation, errors and diagnostics | DEV-004–DEV-005 | Every exposed workflow | Applicable VAL-012 at each phase exit and IT-026. |
| Identity and contact resolution | DEV-011–DEV-012 | All primary methods, association and recovery | IT-004, IT-008–IT-009, IT-012 and IT-023. |
| Phone verification integration | DEV-013 | Registration, OTP sign-in and approved association proof | IT-005, IT-008 and applicable IT-012/IT-025 cases. |
| Email integration | DEV-014 | Registration and DEV-036–DEV-037 recovery | IT-005 and IT-016, preserving distinct source lifecycles. |
| Session/request enforcement | DEV-007, DEV-023 | Every protected workflow; DEV-033–DEV-039 continuity | IT-001, IT-008–IT-009, IT-015–IT-019 and IT-021. |
| Mobile API/storage/routing | DEV-008 | Every mobile story | Per-story interaction tests, IT-017–IT-018 and IT-025. |
| Real authorization policies | DEV-041–DEV-043 | All implemented protected operations | IT-020–IT-023, including earlier stories. |

For any defect fix or shared-module change, rerun the affected source scenarios and dependent integration tests before re-closing its gate. Reopen a completed gate if changed code, configuration or policy invalidates its evidence. Conditional tasks DEV-030 and DEV-035 require either passing implementation evidence or an explicit approved exclusion/deferment; unchecked uncertainty is not equivalent to not applicable.

## 6. Completion Criteria

### 6.1 Development is complete

- Every applicable DEV task is complete with linked evidence; DEV-030 and DEV-035 have an approved, recorded disposition.
- Every mandatory policy/configuration prerequisite for implemented behavior is resolved with attributable evidence. No implementation acceptance relies on an unapproved source proposal or test-only setting.
- The source-to-task matrix covers every selected story portion and applicable requirement; excluded product scope remains explicitly identified.
- Feature migrations, backend/mobile implementations and OpenAPI are synchronized and reviewed under plan Section 10.4 and the constitutional Development Workflow.
- Required lint, type checks, backend/frontend tests and builds pass for the candidate revision. New business logic and resolved defects have appropriate behavior/regression evidence under constitutional Testing Rules.

### 6.2 Integration is complete

- Each phase exit through IT-022 is recorded as passed; every selected method/platform combination and approved protected-operation matrix entry has traceable evidence.
- Real mobile/backend flows use the completed account, identity, session and authorization integrations. Earlier foundation/primary-method fixtures remain confined to tests.
- Required isolated real-provider, database transaction/concurrency, migration and mobile credential-lifecycle results are attached; adapter mocks alone do not close provider/device obligations.
- Cross-story workflows and all applicable plan Section 8.3 failure paths have been exercised with the specification as the outcome authority.
- Source contract, error and state-transition evidence covers the integrated candidate, including affected earlier stories after shared-module changes.

### 6.3 Testing is complete

- IT-001–IT-026 have passing evidence for all applicable cases, with approved dispositions for genuinely conditional cases and no mandatory case blocked or silently skipped.
- Every applicable VAL-001–VAL-019 entry is mapped to the selected specification scenarios and reproducible results. Coverage includes happy paths, negative paths, validation boundaries, authorization, workflow transitions, concurrency, interruption and regression.
- The approved Android/iOS, provider and accessibility matrices are fully evidenced for the selected slice; minimum OS and measurement criteria are resolved before acceptance.
- Security/privacy, integrity and quality results meet their applicable source criteria and approved measurement conditions, with no unresolved defect that violates a required criterion.
- IT-026 confirms the constitutional review and required checks. A blanket numerical code-coverage target or production SLA is not invented to replace the source's acceptance measures.

### 6.4 Feature is ready for verification

- Development, integration and testing completion conditions above are all satisfied, and IT-027 is passed.
- DEV-048 provides a reproducible candidate revision, setup instructions, approved policy/configuration references, safe test data, source/test traceability and complete check/build/provider/device results.
- SC-001, SC-010, applicable SC-011 and SC-012–SC-013 have evidence assessed using their source status and approved targets; any remaining acceptance dependency is visible and prevents an unsupported readiness claim.
- The verification handoff names the responsible reviewer and explicitly identifies the bounded US-001/US-016 scope, conditional dispositions and residual limitations.
- Readiness applies to this authentication and authorization slice. Production deployment, broader product acceptance, unresolved historical import work and commercial/legal/privacy/operational approvals retain their separate gates under plan Section 11 and the specification's clarification register.
