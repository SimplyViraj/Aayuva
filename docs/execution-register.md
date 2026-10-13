# AAYUVYA execution and decision register

## Execution record — DEV-001

| Field | Record |
| --- | --- |
| Date | 2026-10-13, Asia/Calcutta |
| Task selection | All DEV-001–DEV-048 and IT-001–IT-027 in [tasks.md](../tasks.md), authorized by the requesting user’s reply, “All the tasks in tasks.md”. |
| Current task | DEV-010 — account-establishment prerequisite closure and proposal R2 review |
| State | DEV-001–DEV-009 complete within foundation scope; IT-001/IT-002 pass. Owner accepted IT-003 with release-remediation gates retained. DEV-010 is in progress; DEV-011 and later implementation remain pending required policy/technical review. |
| Source authority | [constitution.md](../constitution.md), version 1.0.0; [specifications.md](../specifications.md), especially SRC-013 and Sections 1.1, 4.10; [plan.md](../plan.md), Sections 1–3, 9–10; newer explicit owner directions and EXC-001 in [approved-policies.md](approved-policies.md) |
| Interpretation of authorization | Task execution is authorized. Unresolved product/security choices, constitutional amendments, provider purchases and production deployment are not inferred from task selection. |
| Existing solution | Initially four source documents and no application or Git repository. The current foundation adds only required mobile/backend/configuration/migration/test/documentation deliverables. |
| Allowed changes | Files necessary for the selected tasks. No concrete `#Filenames` list was supplied; the full changed-file inventory is in foundation-files.md. |
| Review evidence | Approved technical baseline and owner decisions/IT-003 acceptance are attributable in approved-policies.md. Codex's implementation/security/data review and passing checks are in foundation-validation.md; new DEV-010 review is in account-readiness.md. |

Source classifications remain authoritative: C/U requirements constrain applicable implementation; B is a selected planning baseline with its stated reviews; P/D is a proposal; Q remains unresolved. Creating a register entry, configuring a test fixture, or selecting every task does not resolve a decision. Do not mark a task complete without its dependencies and acceptance evidence.

## Reviewer and phase-exit ownership

The project owner accepted product decisions, security/privacy review and phase-exit ownership on 2026-10-13 with “I own all three.” Codex prepares implementation and technical evidence; the owner explicitly requests technical choices for review first. Specialist work may be delegated by the owner before its later acceptance gate, but does not prevent establishing this register.

| Responsibility | Required reviewer | Named assignee / approval |
| --- | --- | --- |
| Bounded scope, fields, role grants and business outcomes | Client-designated product owner | Requesting project owner; accepted in conversation |
| Stack, dependency compatibility, architecture, migrations and builds | Technical reviewer | Requesting project owner reviews Codex’s proposal before implementation |
| Credential/session/abuse rules and identity proof | Security owner | Requesting project owner; accepted in conversation |
| Data inventory, consent, retention, deletion and audit access | Privacy owner | Requesting project owner; accepted in conversation; legal expertise/evidence still required where applicable |
| Runtime topology, keys, recovery and measurements | Operations reviewer | Project owner is accountable for approval; specialist assignment/setup before affected acceptance remains pending |
| Device matrix and accessibility evidence | Mobile/accessibility reviewer | Project owner is accountable for approval; actual specialist/device evidence remains pending |
| Independent verification and final handoff | Verification reviewer | Project owner owns phase-exit approval; independent reviewer nomination/evidence remains a later IT-027 prerequisite |

| Phase exit | Required decision / acceptance owners | Current result |
| --- | --- | --- |
| IT-003 / DEL-001 | Technical lead; security owner for access/configuration; mobile reviewer for build scope | Accepted by accountable owner on 2026-10-13; listed release-remediation gates retained |
| IT-007 / DEL-002 | Product owner; security owner; technical lead; mobile reviewer | Not started; DEV-010 account-readiness review and dependent implementation/integration pending |
| IT-011 / DEL-003 | Product owner for method matrix; security owner; technical lead; mobile reviewer | Not started; IT-007 and activation gates pending |
| IT-014 / DEL-004 | Product owner for conflict disposition; security owner; technical lead | Not started; IT-011 and proof/conflict gates pending |
| IT-019 / DEL-005 | Product owner for logout/session outcomes; security owner; technical lead; mobile reviewer | Not started; IT-014 and session/recovery gates pending |
| IT-022 / DEL-006 | Product owner for action/subject grants; security/privacy owner; technical lead | Not started; IT-019 and permission matrix pending |
| IT-027 / DEL-007 | Verification reviewer, supported by product, technical, security/privacy, operations and mobile reviewers | Not started; preceding exits and IT-023–IT-026 pending |

## Bounded source-to-task coverage

This execution covers the authentication slice specified in SRC-013. Full US-001 profile management and US-016 administrative business tools remain outside the slice. Family/couple delegation, memberships, appointments, therapies, credits, payments, programs, passports, reporting and unrelated business modules are excluded. Controlled resource fixtures may validate access boundaries but cannot create production grants or complete future modules.

| Selected story portion | Requirements / rules | Edge cases and quality | Development / integration tasks | Decisions | Validation |
| --- | --- | --- | --- | --- | --- |
| Shared engineering prerequisites | Constitutional stack, validation, configuration, logging, database, testing and workflow; FR-043–FR-044; SEC-001–SEC-003, SEC-009–SEC-012 | NFR-001, NFR-003–NFR-008 where applicable; EC-001–EC-003, EC-008, EC-012–EC-013, EC-039–EC-046 | DEV-001–DEV-009; IT-001–IT-003 | DEC-001, DEC-003–DEC-010, DEC-013, DEC-015–DEC-018 where a policy is encoded | Applicable VAL-007, VAL-010–VAL-015 foundation cases only |
| US-001 identity/account prerequisites | FR-001–FR-002 only for approved minimum profile; FR-008, FR-043, FR-047–FR-052; BR-008–BR-009, BR-011; SEC-004–SEC-005, SEC-010–SEC-012; INT-003 | EC-001–EC-004, EC-047–EC-049, EC-051; shared platform/interruptions | DEV-010–DEV-017; IT-004–IT-007 | DEC-003–DEC-007, DEC-012, DEC-016, DEC-018; CLR-024 | VAL-001, VAL-016; applicable VAL-004, VAL-012–VAL-015, VAL-018 |
| US-002 selected member authentication matrix | FR-003–FR-008, FR-043–FR-044, FR-047–FR-052; BR-001–BR-004, BR-009–BR-012; SEC-001, SEC-004–SEC-008, SEC-010–SEC-012; INT-001–INT-003 | EC-005–EC-008, EC-010–EC-011, EC-047–EC-049, EC-051; shared platform/interruptions | DEV-018–DEV-025; IT-008–IT-011 | DEC-002, DEC-005–DEC-009, DEC-011, DEC-015 | VAL-002–VAL-005, VAL-007; applicable VAL-012–VAL-018 |
| US-003 identity continuity and secure association | FR-007–FR-009; BR-001–BR-003; SEC-008, SEC-010–SEC-012 | EC-004, EC-010–EC-011, EC-039–EC-040; shared platform behavior | DEV-026–DEV-030; IT-012–IT-014 | DEC-004, DEC-011, DEC-016, DEC-018 | VAL-006; relevant VAL-001, VAL-005, VAL-011–VAL-013, VAL-015–VAL-016 |
| US-004 sessions, logout and eligible recovery | FR-010–FR-012, FR-044, FR-050, FR-053–FR-054; BR-004–BR-006, BR-012; SEC-006–SEC-009; INT-006 | EC-008–EC-009, EC-013, EC-039–EC-042, EC-050; shared platform behavior | DEV-031–DEV-039; IT-015–IT-019 | DEC-005, DEC-007–DEC-010, DEC-012, DEC-015–DEC-017 | VAL-007–VAL-009, VAL-013, VAL-017, VAL-019; applicable VAL-012, VAL-014–VAL-015 |
| US-017 role/ownership enforcement; US-016 protected-access boundary only | FR-040–FR-042 only for access boundary; FR-044, FR-052; BR-007; SEC-001–SEC-003, SEC-009–SEC-012 | EC-012, EC-017, EC-041, EC-044, EC-051; shared platform behavior | DEV-040–DEV-045; IT-020–IT-022 | DEC-002, DEC-009, DEC-013–DEC-016 | VAL-010–VAL-012, VAL-016; applicable VAL-002, VAL-007, VAL-013, VAL-015 |
| Integrated regression and verification handoff | All applicable rows above; constitutional completion gate; SC-001, SC-010, applicable SC-011, SC-012–SC-013 | Candidate-specific source scenarios, defects, concurrency, interruption, platform/provider evidence and approved measurement conditions | DEV-046–DEV-048; IT-023–IT-027 | All applicable decisions, especially DEC-015–DEC-018 | All applicable VAL-001–VAL-019 |

FR-045–FR-046 apply to repeated effects and related changes only according to their source classification and approved outcomes. The matrices above organize evidence; the specification’s story scenarios and edge-case outcomes remain authoritative. Numerical coverage targets and production service commitments are not added.

## DEC-001–DEC-018 decision register

Every row was reviewed against plan Section 3 and tasks Section 5.2 on 2026-10-13. The table preserves the earlier baseline; [approved-policies.md](approved-policies.md) records the subsequent owner-approved changes and takes precedence for current execution. In particular, owner assignment, India phones, name/email rules, 12–128 password limits, Argon2id and EXC-001 are now recorded. Remaining values and acceptance results are not silently upgraded. The project owner holds the accountable review responsibilities above.

| Decision | Source and preserved status | Responsible reviewer | First affected task / subsequent gate | Evidence required before dependent acceptance |
| --- | --- | --- | --- | --- |
| DEC-001 — bounded execution scope | SRC-013; CLR-001. Bounded planning scope selected; this conversation authorizes all tasks. Full-product approvals and names remain open. | Product owner; technical lead | DEV-001; every phase exit | Named reviewer assignments and review of this scope/register; no broader product approval inferred |
| DEC-002 — method/platform/role activation | SRC-013; CLR-003. Four member methods selected; first method, privileged-method policy and production configuration open. | Product owner; technical/security owners | DEV-018; DEV-019–DEV-025; DEV-040/DEV-042 for privileged methods | Approved member/platform and privileged-role method matrix; activation configuration owner and environment; backend rejection cases |
| DEC-003 — account/profile/contact boundaries | SRC-013; CLR-002. Required phone and applicable email verification selected; exact fields/limits/age/countries/email normalization open. | Product/privacy owners | DEV-010; DEV-011–DEV-017; IT-007 | Approved minimum fields and bounds, age disposition, country eligibility, email/contact normalization and pending-access contract |
| DEC-004 — verified identity and collision handling | SRC-013; CLR-005. Canonical identity, reauthenticated linking and unique verified phone baseline selected; evidence/recycled-phone/support policy open. | Product/security owners | DEV-010 / DEV-012; DEV-026–DEV-030; IT-014 | Verification/contact ownership and collision rules; reauthentication recency/proof binding; safe conflict outcome; assisted-resolution disposition |
| DEC-005 — password policy and hashing | SRC-013; CLR-004. Minimum 8 and no current-password reuse confirmed; hash/calibration/maximum/count semantics open. | Security/technical owners | DEV-018 / DEV-019; DEV-031 / DEV-037 | Maintained algorithm and calibrated parameters; approved maximum and character counting; boundary and current-password regression evidence |
| DEC-006 — Twilio verification and OTP controls | SRC-013; CLR-004, CLR-024. Twilio selected; limits 5 checks, 60-second cooldown, 5 requests/hour provisional; constitutional conflict unresolved. | Security/technical governance owners | DEV-010 / DEV-013; IT-005 / IT-007 | Explicit governance resolution allowing delegation; reviewed expiry/resend/provider settings and app limits; trusted provider configuration and bound-result evidence |
| DEC-007 — shared abuse enforcement | SRC-013; CLR-004, CLR-021. Sensitive operations need abuse controls; dimensions/limits/proxy topology/retention unresolved. | Security/operations/privacy owners | DEV-010 / DEV-013; DEV-018; DEV-031 where extended | Per-operation policy, deployment topology, trusted-proxy boundary, multi-instance enforcement and approved retention; no process-local global-limit claim |
| DEC-008 — access JWT and signing keys | SRC-013; CLR-004. RS256 and 15 minutes provisional; issuer/audience/key lifecycle/clock tolerance open. | Security/technical owners | DEV-001 review; DEV-007; DEV-018 / DEV-023; DEV-031 / DEV-033 | Approved algorithm/duration/claims/clock and key lifecycle; trusted configured issuer/audience; key-boundary tests before real issuance |
| DEC-009 — sessions and revocation | SRC-013; CLR-004. Backend sessions/current logout selected; 30-day inactivity and 5-session cap provisional; event/cap/race semantics open. | Product/security owners | DEV-001 review; DEV-007; DEV-018 / DEV-023; DEV-031 / DEV-034–DEV-035 | Approved activity/expiry/cap definitions, rejection or eviction behavior, event scope and in-flight semantics; logout-all approved disposition |
| DEC-010 — rotating refresh and replay/races | SRC-013; CLR-004. Rotation selected; family/reuse/concurrency/lost-response/lifetime details open. | Security/technical owners | DEV-031; DEV-032–DEV-033 / DEV-038; IT-015 / IT-017 | Approved family boundaries, refresh lifetime, replay response and legitimate concurrency/lost-response semantics; real concurrent-database evidence |
| DEC-011 — provider and callback trust | SRC-013; CLR-003, CLR-020. Backend verification selected; accounts/client IDs/audiences/redirects/build setup open. | Technical/security owners | DEV-002 technical review; DEV-018 / DEV-021–DEV-025; DEV-026 / DEV-027 | Version-specific integration review; actual trusted platform/provider configuration; native/OAuth callback and wrong-context test evidence |
| DEC-012 — email verification and recovery | SRC-013; CLR-002, CLR-004–CLR-005. Reset 5 minutes/single use/supersession confirmed; registration lifecycle/vendor/reset session effects open. | Product/security/technical owners | DEV-010 / DEV-014; DEV-031 / DEV-036–DEV-037 | Registration expiry/resend/supersession and provider selection; verified-email eligibility/delivery; reviewed reset session effects |
| DEC-013 — trusted roles and action grants | SRC-013; CLR-017. MEMBER/OPERATOR/ADMIN selected, public MEMBER only; actual grants/bootstrap/propagation open. | Product/security owners | DEV-001 defaults review; DEV-007 fixtures only; DEV-040 / DEV-041–DEV-043 | Approved action-by-role-by-subject matrix, trusted bootstrap/change authority, audit and race policy; fixtures cannot approve production privileges |
| DEC-014 — ownership and collections | SRC-013; CLR-006, CLR-017. Backend stored ownership and unknown-permission denial selected; family delegation deferred; real grants open. | Product/security/privacy owners | DEV-040 / DEV-043; IT-020–IT-022 | Approved subject/collection constraints and mutation-relevant concurrent-change semantics; actual protected-operation evidence |
| DEC-015 — mobile/build/accessibility matrix | SRC-013; CLR-020. Android/iOS, English, Expo Go then required EAS development builds selected; device/OS/accessibility/accounts open. | Technical/mobile/accessibility owners | DEV-002 / DEV-008; each mobile task; DEV-047 | Reviewed navigation/storage/version choice; OS/device/accessibility matrix and signing/build readiness; actual evidence for both platforms |
| DEC-016 — diagnostics/privacy/audit | SRC-013; CLR-021. India scope and minimization selected; 30-day diagnostics, 180-day security audit and 2-year privileged audit provisional. | Privacy/legal/security owners | DEV-001 review; DEV-005; DEV-010 / DEV-026 / DEV-040; DEV-046 | Approved permitted data fields, access/consent/deletion/overlap/retention; applicable privacy review; no legal-sufficiency assumption |
| DEC-017 — quality and operational recovery | SRC-013; CLR-022. Failure visibility and repeatable evidence required; <500 ms API p95, <2 s interactions and 99.5% availability provisional. | Product/operations/technical owners | Affected workflow gates; DEV-047; IT-024 | Approved load/network/device conditions, measurement definitions, recovery/support/delivery targets; production availability cannot be proved by local tests |
| DEC-018 — existing data continuity | SRC-013; CLR-023. No live Zoho; no verification inferred from exports. Import or no-history disposition open. | Product/data/security owners | DEV-010 / DEV-026 if existing identities affected; production initialization; DEV-046 | Explicit continuity decision; if needed, separately reviewed export/mapping/reconciliation and credential strategy; synthetic databases do not resolve continuity |

### CLR-024 governance gate

The owner explicitly approved EXC-001 in [approved-policies.md](approved-policies.md), resolving the backend OTP-ownership conflict for Twilio phone verification only. NestJS retains identity, purpose/country/rate validation and local-transition/session authority; no local OTP fallback is permitted. DEV-013 still waits for its foundation/account dependencies and the remaining verification-control/provider decisions.

## Validation-to-execution map

These are planned evidence assignments, not executed results. Every actual result must name a candidate revision or file fingerprint, approved policy/configuration, test data, command/procedure, outcome and evidence location. Source outcome details remain in plan Section 10.2 and the specification.

| VAL case | Implementation consumers | Integration evidence owners / tasks |
| --- | --- | --- |
| VAL-001 — account boundaries | DEV-011–DEV-017; affected identity association | IT-004 / IT-007; relevant IT-012–IT-014; final IT-023 |
| VAL-002 — complete method matrix | DEV-019–DEV-025; DEV-042 | IT-008–IT-011; privileged-method IT-020; IT-023 / IT-025 |
| VAL-003 — password evidence | DEV-019; credential transitions | IT-008; relevant IT-016; IT-023 |
| VAL-004 — OTP proof and failures | DEV-013 / DEV-015 / DEV-020 | IT-005 / IT-008; relevant IT-012; IT-023 / IT-025 |
| VAL-005 — Google/Apple trust | DEV-021–DEV-022 / DEV-025 / DEV-027 | IT-009–IT-010 / IT-012; IT-023 / IT-025 |
| VAL-006 — continuity and association | DEV-027–DEV-030 when enabled | IT-012–IT-014; IT-023 |
| VAL-007 — token/session boundaries | DEV-007 / DEV-023 / DEV-032–DEV-034 | Foundation IT-001; IT-008–IT-009 / IT-015 / IT-021 / IT-023 |
| VAL-008 — logout/revocation | DEV-034–DEV-035 when enabled / DEV-039 | IT-015 / IT-017–IT-019 / IT-023 |
| VAL-009 — recovery and refresh | DEV-033 / DEV-036–DEV-039 | IT-015–IT-019 / IT-023 |
| VAL-010 — actual action/subject grants | DEV-007 fixtures; DEV-041–DEV-045 actual policies | Foundation IT-001; IT-020–IT-022 / IT-023 |
| VAL-011 — paths, collections and stale checks | DEV-007 fixtures; DEV-028 / DEV-042–DEV-043 | IT-001; affected IT-012–IT-014; IT-020–IT-023 |
| VAL-012 — validation/diagnostic leakage | DEV-004–DEV-005 and every exposed workflow | IT-002 plus each applicable phase integration; final IT-026 |
| VAL-013 — mobile state and interruption | DEV-008 / DEV-017 / DEV-025 / DEV-029 / DEV-038–DEV-039 / DEV-044 | IT-002 / IT-006 / IT-010 / IT-013 / IT-017 / IT-021 / IT-025 |
| VAL-014 — Android/iOS/device lifecycle | Every mobile consumer of DEV-008 | IT-006 / IT-010 / IT-018 / IT-025; gaps block exits |
| VAL-015 — migrations, concurrency and configuration | DEV-004 / DEV-006; every atomic persistence consumer | IT-001 / IT-005 / IT-015 / IT-020; final IT-024 |
| VAL-016 — verification and pending access | DEV-011–DEV-017 / DEV-024–DEV-025 / DEV-042 | IT-004 / IT-007 / IT-008; relevant IT-012 / IT-020; IT-023 |
| VAL-017 — password/reset boundaries | DEV-019 / DEV-036–DEV-037 | IT-008 / IT-016 / IT-019 / IT-023 |
| VAL-018 — trusted Twilio application | DEV-013 / DEV-015 / DEV-020 | IT-005 / IT-008 / IT-023 / IT-025 |
| VAL-019 — restoration, rotation and replay | DEV-032–DEV-039 | IT-015 / IT-017–IT-019 / IT-023 / IT-025 |

## Execution ledger and next dependencies

The task-level dependencies in tasks.md remain authoritative. A later phase is not started to work around an unresolved current-phase exit.

| Task IDs | State on 2026-10-13 | Remaining dependency / next action |
| --- | --- | --- |
| DEV-001 | Complete | Authorization, full decision/validation mapping and accountable owner assignment recorded; unresolved policies stay mapped to their affected tasks |
| DEV-002 | Complete; presented R1 approved by “all revisions are approved” | Tooling/folder/build decisions recorded; exact resolved patches/check results belong to DEV-003 |
| DEV-003 | Complete | Locked packages, lint, TypeScript, backend startup/build and Android/iOS bundle exports pass; native/device evidence remains distinct |
| DEV-004–DEV-009 | Complete within foundation scope | Validated config, safe diagnostics, reviewed schema/migration, gated access primitives, mobile libraries and deterministic isolated tests implemented; real workflow/policy activation remains later tasks |
| IT-001–IT-002 | Foundation integration passes | 68 backend unit/request tests, 4 real PostgreSQL tests and 31 isolated mobile tests pass; evidence and source mapping in foundation-validation.md |
| IT-003 | Complete; accepted by accountable owner | Owner accepted foundation exit with listed release-remediation gates retained; findings remain tracked for later release review |
| DEV-010 | In progress | Latest no-age-gate/email supersession decisions recorded; concrete account-readiness.md proposal R2 requires OTP, registration abuse/privacy and technical review |
| DEV-011–DEV-017; IT-004–IT-007 | Not started/run | DEV-010 closure and task dependencies; actual Twilio/email and platform evidence at applicable activation/integration gates |
| DEV-018–DEV-025; IT-008–IT-011 | Not started/run | IT-007; approved method/security/session activation and provider/build configuration |
| DEV-026–DEV-029; IT-012–IT-014 | Not started/run | IT-011; approved proof/conflict/recovery policy and DEV-030 disposition |
| DEV-030 | Conditional; no exclusion or implementation approved | DEV-026 decision on assisted resolution; if enabled, approved authority/evidence/audit |
| DEV-031–DEV-034, DEV-036–DEV-039; IT-015–IT-019 | Not started/run | IT-014; approved session/refresh/reset race and lifecycle decisions; DEV-035 disposition; real device/storage evidence |
| DEV-035 | Conditional; no exclusion or implementation approved | Reviewed logout-all scope/UX/revocation policy and prerequisite session tasks |
| DEV-040–DEV-045; IT-020–IT-022 | Not started/run | IT-019; approved real action/subject matrix, provisioning, audit and concurrent authority policy |
| DEV-046–DEV-048; IT-023–IT-027 | Not started/run | IT-022 and all required earlier exits; completed candidate, operational decisions, approved measurement/device matrices and independent review |

### Environment evidence

- Node.js `v24.16.0`, npm `11.13.0`, Git, Python and the Docker client are installed.
- `git status --short` reported that the workspace is not a Git repository. No branch or commit evidence exists.
- Initial sandboxed network/Docker/compiler restrictions were resolved with approved escalation. Dependencies are installed and locked; generated clients and build/cache artifacts are ignored.
- Docker Desktop was started; isolated PostgreSQL 18.6 on loopback is available. The guarded migration and actual constraint/rollback/concurrency/repository tests pass. No production database was touched.
- Backend and mobile lint, strict type checks, all 103 tests, backend compilation and Android/iOS Hermes exports pass. See [foundation-validation.md](foundation-validation.md) for commands, limitations, dependency findings and the file/hash inventory.

### DEV-001 acceptance checklist

- [x] Record implementation authorization and bounded US-001/US-016 scope.
- [x] Map selected stories, requirements, DEC entries, relevant CLR entries, VAL cases and downstream task dependencies.
- [x] Preserve provisional/unresolved source status and specify required decision evidence.
- [x] Identify required reviewer roles and phase-exit responsibilities.
- [x] Obtain accountable reviewer assignments and accepted phase-exit ownership: requesting project owner, “I own all three.”
- [x] Record owner directions and the technical-review boundary, then complete DEV-001 in tasks.md. Subsequent task acceptance remains separate.

Owner answers are recorded in approved-policies.md. DEV-001–DEV-009 are complete within foundation scope; IT-003 was accepted with release-remediation gates retained. DEV-010 is active, with remaining decisions presented in account-readiness.md. No unpresented policy, real provider/device success or deployment approval is inferred.
