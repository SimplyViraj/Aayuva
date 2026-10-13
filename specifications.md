# AAYUVYA Product Specification

## 1. Document Metadata

| Field | Value |
| --- | --- |
| Product | AAYUVYA wellness membership and service management mobile application |
| Feature identifier / branch | NEEDS CLARIFICATION. No approved feature identifier is available; the inspected folder is not a Git repository. |
| Creation date | 2026-10-12, using the supplied Asia/Calcutta date context |
| Status | Draft for product clarification and review; not approved for implementation |
| Primary source | [constitution.md](constitution.md), version 1.0.0; ratified and last amended 2026-10-02 |
| Additional sources | Original task/platform decisions (SRC-010–SRC-011), historical proposal (SRC-012), and consolidated decisions dated 12 October 2026 (SRC-013), which supersede earlier proposals within stated approval limits |
| Related documents | No additional project documents were present in the inspected folder. The IDE references README.md and specifications.md, but neither existed on disk before this document was generated. Their contents cannot be treated as evidence. |
| Applicable release | SRC-013 selects the bounded authentication planning slice; the full product capability/release matrix remains NEEDS CLARIFICATION — CLR-001. Android and iOS smartphones are confirmed for the initial release by SRC-011; neither may be excluded without explicit approval. No approved release number or delivery date is available. |
| Specification scope | Document the constitution's named product capabilities, mandatory business-facing safeguards, proposed minimum observable behavior, and unresolved decisions. Product-level inclusion does not establish inclusion in the first release. |
| Intended business outcome | Enable members to manage their wellness accounts and participation, and enable authorized administrators to support membership, appointment, session, and commercial operations with consistent information and protected access. |
| Approval authority | SRC-013 identifies product-owner, technical-lead and security/privacy responsibilities; named owners and recorded signoffs remain NEEDS CLARIFICATION — CLR-001. |

### 1.1 Source register and interpretation

| Source ID | Exact source area | Requirements evidence |
| --- | --- | --- |
| SRC-001 | Constitution introduction | Individual, family and couple accounts; memberships and plans; appointments; therapy sessions and credits; wellness programs and enrollment; digital wellness passports; notifications and reminders; payments, billing and transactions; administrative operations; profiles; role-based access; multiple-provider authentication |
| SRC-002 | Constitution: Authentication and Identity Rules, including all subsections | Conditional authentication methods; one internal identity; verified identity association; credentials, OTPs, provider verification, expiration, logout and recovery safeguards |
| SRC-003 | Constitution: Authorization Rules | Role-based permissions, ownership checks, authorized administration, consistent protection of resources |
| SRC-004 | Constitution: Validation Rules; Backend Rules | Required-field, type, length, identifier, date, numeric and business-constraint validation |
| SRC-005 | Constitution: Frontend Rules; Logging and Exception Handling Rules; API Rules | Observable loading, success, empty, error, unauthorized and network-failure handling; consistent errors; failures must not be silently hidden |
| SRC-006 | Constitution: Security Rules; Authentication Security Rules | Least privilege, confidential communications, protection of secrets and sensitive data, abuse prevention |
| SRC-007 | Constitution: Database Rules; Performance Rules | Integrity of related operations, uniqueness where required, correctness over optimization, manageable large result sets |
| SRC-008 | Constitution: Testing Rules; Git and Development Rules; Development Workflow | Repeatable behavioral validation, success and failure coverage, quality and compliance gates |
| SRC-009 | Constitution: Project Technology Standards; Governance; AI Code Generation Rules | Mandatory technology decisions and governance; changes must not silently bypass constraints |
| SRC-010 | User task: Product Context; Technology and Implementation Boundaries; Scope Restrictions | Fresh implementation; React Native with Expo and TypeScript; Expo-compatible workflow; Expo Go preferred where feasible; no scope expansion, clinical assumptions or implementation in this document |
| SRC-011 | User decision: CLR-020 — Platform compatibility and accessibility, supplied 2026-10-12 | Android and iOS smartphones both in the initial release; exclusion requires explicit approval; minimum OS versions agreed before acceptance; representative device evaluation; responsive behavior for screen sizes, system text scaling, keyboards and platform navigation. English is proposed, and additional languages may be deferred. |
| SRC-012 | Attached “AAYUVYA — Clarification Resolution Register,” dated 12 October 2026; identifier `aayuvya-mvp-clarifications` | Supporting proposals explicitly pending client approval, covering CLR-001–CLR-003 and an incomplete CLR-004. The identifier belongs to the proposed register, not a verified repository branch. These proposals do not establish approved release scope, roles, registration fields or enabled authentication methods. |
| SRC-013 | User-supplied “AAYUVYA — Consolidated Clarification Decisions,” 12 October 2026, sections 1–30 | Current planning baseline: confirmed user directions, selected approaches and explicitly provisional values. Covers CLR-001–CLR-008, CLR-020–CLR-022 and plan DEC-001–DEC-018; CLR-023 continuity is addressed through DEC-018. No client commercial/legal/privacy/operational approval claimed. |

SRC-012 is historical evidence; SRC-013 supersedes its conflicting onboarding, methods, roles and scope. This update does not authorize implementation.

Evidence classifications apply throughout:

- **C — Constitutional requirement:** an explicit obligation or named capability in the constitution. A named capability alone does not specify its detailed business policy or release.
- **U — Confirmed user decision:** explicit direction in SRC-011/SRC-013, including platforms, mandatory verification and password/reset rules; not proof of client commercial/legal/privacy/operational approval.
- **B — Selected planning baseline:** an approach selected by SRC-013; stated technical/security/business review remains outstanding.
- **D — Derived proposal:** a minimal, business-facing interpretation of a named capability or safeguard. Review is required; proposed behavior is not an existing approval.
- **P — Supplied proposal:** explicitly provisional policy/value in SRC-012/SRC-013; superseded proposals do not govern current behavior.
- **Q — Conditional / unresolved:** behavior depends on an enabled method, an approved policy or a scope decision. Its condition must be resolved before its acceptance scenarios can be used as a release gate.
- **NEEDS CLARIFICATION:** no decision is evidenced. Absence of documentation is neither approval nor a decision to defer.

“The system shall” in a D, P, B or Q entry describes the proposed obligation if approved or enabled. It does not promote that entry to an approved requirement. Controlled acceptance data may demonstrate behavior against a supplied policy, but must never substitute for approval of that policy.

### 1.2 Capability and release disposition

Constitution-named capabilities remain represented at product level. SRC-013 selects US-002–US-004 and US-017 for authentication planning, with only US-001 identity prerequisites and US-016 access boundaries. Complete product release scope still needs client approval.

The platform boundary is resolved independently of that capability selection: the initial release must support both Android and iOS smartphones (SRC-011; CLR-020). Omitting either platform requires explicit approval. The remaining device and OS acceptance matrix is not yet approved.

| Capability | Evidence and disposition | Coverage / unresolved boundary |
| --- | --- | --- |
| Individual account registration and profiles | SRC-013 selects self-service MEMBER registration with mandatory phone verification and email verification for email/password; exact profile/age rules remain open | US-001; CLR-002 |
| Authentication and account access | SRC-013 selects all four member methods under the platform/configuration matrix; safeguards remain mandatory | US-002–US-004, US-017; CLR-003–CLR-005 |
| Family and couple accounts | Named product scope; SRC-013 defers relationships and delegation until lifecycle/permissions approval | US-005; CLR-006 |
| Memberships, plans and management | Named product scope; lifecycle and eligibility unspecified | US-006; CLR-007 |
| Wellness service discovery and booking | Appointments are named; SRC-013 proposes approved service/member/operator-resource booking; catalog and operational policy still need approval | US-007 covers proposed appointment arrangement; CLR-001, CLR-008, CLR-010 and CLR-017 address discovery/role gaps |
| Appointment scheduling and management | Appointments named; cancellation and rescheduling rights are not established | US-007–US-008; CLR-008–CLR-009 |
| Wellness sessions | Constitution uses “therapy sessions”; operational meaning unresolved | US-009; CLR-010 |
| Wellness programs and enrollment | Named product scope; session relationships and enrollment rules unspecified | US-010; CLR-011 |
| Session credits, balances and consumption | Credits named; grant source, unit, eligibility and deduction rules unspecified | US-011; CLR-012 |
| Digital wellness passport | Named product scope; advanced passport/progress capabilities deferred from the selected authentication slice under SRC-013 | US-015 covers the passport; extended tracking needs scope and behavior under CLR-001, CLR-016 |
| Notifications and reminders | Named product scope; events, recipients and channels unspecified | US-012; CLR-013 |
| Payments, billing and transactions | Named product scope; payable items and financial policies unspecified | US-013–US-014; CLR-014–CLR-015 |
| Administrative operations and role-based access | Named product scope; MEMBER/OPERATOR/ADMIN selected for planning, with action grants and provisioning authority still open | US-016–US-017; CLR-017 |
| Membership and service administration | Membership administration is a candidate within named administration; service-management actions not expressly established | US-016; CLR-008, CLR-017 |
| Operator and equipment scheduling | Not sufficiently documented to determine status; task checklist is not approval | CLR-018; no committed story or operational entity |
| Calendar, resource and operating-hours management | Not sufficiently documented to determine status beyond basic appointments | CLR-008, CLR-018 |
| Member dashboard | Not sufficiently documented to determine status; no required consolidated presentation | CLR-019 |
| Operational reporting and oversight | Not sufficiently documented to determine report scope, metrics or access | CLR-019; administration does not imply analytics |

**Deferred from authentication:** family/couple relationships and delegation, advanced wellness/passport/progress/reporting and unrelated business features. Product stories remain for discovery. English is now the initial language; no Phase 2 schedule is inferred.

**Excluded from this specification:** diagnosis, treatment decisions, prescriptions, clinical records, and doctor or therapist roles, unless separately supported by approved requirements. The constitution's “healthcare-oriented” and “therapy” wording does not establish these capabilities. OPERATOR is a selected role under SRC-013, but its grants and scheduling workflow require clarification. These boundaries exclude unsupported requirements from this draft; they do not assert a permanent product-roadmap decision.

### 1.3 Constraints, tensions and readiness

The approved development constraints are React Native and TypeScript, with the user-directed Expo workflow: Expo Go mandatory initially for compatible work, then EAS cloud development builds for required native/OAuth validation. The constitution also fixes NestJS, Node.js, PostgreSQL, Prisma/Prisma Migrate, REST, JWT, Swagger/OpenAPI, Jest and React Native Testing Library, with Supertest where appropriate. These are inherited planning constraints, not functional requirements or a new technical design. Other constitutional engineering and governance rules remain applicable by reference.

Current reconciliation:

1. SRC-013 supersedes “only Google on Android”: email/password, OTP and Google are planned on both smartphone platforms; native Apple sign-in is on iOS with approved non-Apple alternatives on Android.
2. MEMBER, OPERATOR and ADMIN are selected roles; real action permissions remain subject to approval. No therapist or clinical role is inferred.
3. Twilio Verify must generate/check SMS codes, while AAYUVYA must not generate/persist/log them. The constitution says “OTP generation and verification must occur on the backend.” CLR-024 records this direct conflict; no amendment or local OTP fallback is inferred.
4. Five failed checks, 60-second cooldown and five requests per phone per rolling hour are described as both proposals and initial limits. Keep them provisional pending security review; provider expiry is unconfirmed.
5. RS256, 15-minute access lifetime, 30-day inactivity, five active sessions, retention and quality targets remain provisional. Persistent tracked sessions and rotating refresh are selected planning behavior, not nonexpiring tokens.
6. English and Windows/physical iPhone/no Mac are established context. Expo Go is required initially for compatible work; EAS development builds validate required native/OAuth flows. Both platforms need evidence.

The consolidated baseline does not establish client commercial/legal/privacy/operational approval. The constitution is unchanged; remaining decisions are explicit.

## 2. User Scenarios and Validation

### 2.1 Prioritization and scenario conventions

Priorities are **proposed**, pending CLR-001: **P1 — Essential** protects identity, access, information integrity or a principal membership/service journey; **P2 — Important** supports subsequent operational or member journeys. No P3 enhancement is invented. Family/couple accounts or programs may become P1 if the selected launch model depends on them.

Full-product release scope remains **NEEDS CLARIFICATION (CLR-001)**; the authentication planning slice is selected by SRC-013. Each story delivers a named product capability or constitutional access outcome, but detailed D and Q behavior requires approval. “Authorized” means permitted by the eventual role-and-ownership matrix, not simply signed in. “Approved policy” means an actual agreed rule; none is implied by a test fixture. Membership state, payment state, appointment state and session state are distinct concepts until their relationships are explicitly defined.

**Shared platform acceptance scenarios (SRC-011, SRC-013; NFR-006–NFR-007; SC-012):** apply these to every story selected for the initial release without creating a new business capability.

- **Both smartphone platforms:** Given a selected release story and an approved representative Android or iOS smartphone configuration, when its acceptance journey is exercised on each platform, then the required business behavior is available on both platforms. Failure on one platform does not authorize excluding it from acceptance.
- **Screen sizes and system text scaling:** Given a supported smartphone configuration and a system text size within the agreed test matrix, when the user completes the journey, then required information and controls remain readable and reachable without clipping, overlap or loss that prevents completion. Exact configurations and scaling coverage remain CLR-020.
- **Keyboard interactions:** Given a journey with text input, when the platform keyboard is displayed, focus changes or the keyboard is dismissed, then the user can reach the required fields, review relevant validation and complete the action.
- **Platform navigation:** Given a journey on either supported platform, when the user performs its applicable platform navigation actions, then the journey follows that platform's conventions without losing access to required actions or misrepresenting the business outcome.
- **Accessibility:** Given the agreed screen-reader, focus, contrast and touch-target criteria, when a selected journey and its validation/failure recovery are exercised on each platform, then controls are meaningfully labeled, focus is logical and actions/errors remain understandable and operable. Exact standards and thresholds remain CLR-020.
- **Independent validation:** repeat each selected story's controlled inputs and expected business outcomes across the agreed Android and iOS matrix, including representative screen sizes, resolutions, OS versions, device capabilities, text scaling, keyboard and navigation interactions. Success requires the story and applicable interaction scenarios to pass on both platforms. An excluded platform without explicit approval, an inaccessible required action or acceptance without agreed minimum OS versions is failure. The exact device/version/accessibility coverage remains blocking under CLR-020.

### US-001 — Establish an individual account and maintain a profile

**Current baseline (SRC-013):** Self-service registration requires primary authentication, verified phone for every method, verified email for email/password, and approved minimum profile data. Pending members have only registration/verification/recovery access; demographics are not mandatory by default.

- **Priority:** P1, proposed; prerequisite for identifiable member journeys.
- **Primary role:** prospective member / member.
- **Capability:** individual account and profile management. **Release:** CLR-001.
- **Dependencies:** selected identity methods (US-002), field definitions (CLR-002), access controls (US-017).
- **Story:** As a member, I want an individual account and an accurate profile, so that my wellness participation is associated with the correct person.
- **Business value:** establishes reliable ownership and usable member information.
- **Preconditions:** account/profile field rules and a permitted registration route have been approved; profile editing additionally requires authorized access.
- **Acceptance scenarios:**
  - **Mandatory verification:** Given valid Google/Apple or password authentication but incomplete required phone/email verification, when a protected member feature is requested, then access is denied until all registration conditions hold.
  - **Unique verified phone:** Given a phone already verified for another member, when claimed during registration, then the conflicting association is stopped without merging or foreign-data disclosure.
  - **Controlled public privilege:** Given public registration carrying OPERATOR/ADMIN or verification-state values, when submitted, then only MEMBER provisioning is permitted and client-supplied security state is rejected.
  - **Valid account:** Given an approved registration route and valid required information, when the person completes its verification requirements, then the account is associated with one internal identity and the outcome is shown (D/Q; FR-001).
  - **Profile update:** Given an authorized member and an editable profile field, when a valid change is submitted, then the member can retrieve the accepted value (D; FR-002).
  - **Invalid or incomplete input:** Given missing required information, unsupported values or values outside approved bounds, when submitted, then the change is rejected with an understandable correction outcome and no completed change is falsely reported (C/Q; FR-043).
  - **Duplicate or foreign profile:** Given a conflicting existing identity or another person's profile, when a creation or update is attempted, then secure identity resolution or access denial applies; an unverified match does not authorize merging (US-003, US-017).
- **Independent validation:** Use a new person, an existing member and a foreign profile. Test every required verification gate, pending restrictions, normalized phone collision and forged role/status input; exercise profile editing only within separately approved scope. Success means one correctly owned identity and no protected member access before completion. Exact fields/age/country cases require CLR-002.
- **Current decision traceability:** FR-047–FR-049, FR-051–FR-052; CLR-002–CLR-005, CLR-024.
- **Traceability:** SRC-001–SRC-004; FR-001–FR-002, FR-043; SEC-001–SEC-003; CLR-002.

### US-002 — Sign in through enabled authentication methods

**Current baseline (SRC-013):** Email/password, OTP and Google are planned on Android/iOS; native Apple on iOS with approved non-Apple alternatives on Android. Production configuration gates each method. Twilio performs phone code checks through NestJS; CLR-024 records the constitutional conflict.

- **Priority:** P1, proposed; access prerequisite.
- **Primary role:** member or authorized administrative user.
- **Capability:** authentication. **Release:** CLR-001.
- **Dependencies:** method enablement and authentication policy (CLR-003–CLR-004); US-003 for existing identity association.
- **Story:** As an account holder, I want to sign in through an enabled method, so that I can access my permitted account functions.
- **Business value:** secure, usable account access without fragmented identities.
- **Preconditions:** the method is enabled and the relevant account or registration policy is defined.
- **Acceptance scenarios:**
  - **Provider-managed check:** Given a code for the intended member/phone/purpose, when entered and submitted through NestJS, then only a trusted Twilio Verify approval can support the application verification result; delivery alone and client success flags cannot.
  - **Unconfigured provider:** Given invalid or absent production provider configuration, when sign-in is attempted, then it fails closed without silently deleting the method from product scope.
  - **Email/password, if enabled:** Given valid account credentials and completed mandatory registration verification, when authentication succeeds, then protected access identifies the correct internal user; invalid credentials do not grant access.
  - **Mobile/OTP, if enabled:** Given an issued, unexpired, unused code for the permitted verification context, when Twilio verifies it and required onboarding is complete, then NestJS grants the permitted access and the code cannot authorize another completion. Wrong, expired and previously consumed codes fail.
  - **Google or Apple, if enabled:** Given a valid verified provider identity, when authentication succeeds, then it resolves to the associated internal user; expired, invalid or unverified identity evidence does not grant access. Apple's private relay email does not replace the verified provider identity.
  - **Provider failure or excessive attempts:** Given failed delivery, unavailable identity verification or an exceeded approved attempt limit, when sign-in is attempted, then the user receives an appropriate failure or restriction outcome and is not reported as authenticated.
- **Independent validation:** Exercise the selected member/platform matrix with valid, invalid, expired and reused evidence, incomplete onboarding and controlled provider failure. Valid complete accounts resolve to the correct identity; incomplete or rejected cases receive no protected member access. Provider configuration, privileged-method access and final limit settings remain CLR-003–CLR-004; delegated phone verification also requires CLR-024.
- **Current decision traceability:** FR-005, FR-047–FR-049; INT-003; CLR-003–CLR-004, CLR-024.
- **Traceability:** SRC-002, SRC-005–SRC-006; FR-003–FR-007; SEC-004–SEC-009; INT-001–INT-003.

### US-003 — Preserve one identity across supported sign-in methods

**Current baseline (SRC-013):** Linking requires reauthentication to the existing account and proof of control of the new method. Verified phone is unique to one member unless an exception is approved. Self-service merging is excluded; assisted resolution needs authorization, identity checks and audit evidence.

- **Priority:** P1, proposed; prevents fragmented access to business records.
- **Primary role:** account holder.
- **Capability:** identity association. **Release:** CLR-001.
- **Dependencies:** US-002; verified association and conflict-resolution policy (CLR-005).
- **Story:** As an account holder, I want supported sign-in methods to resolve to my verified identity, so that my account information is not accidentally split or exposed.
- **Business value:** continuity of membership and participation ownership.
- **Preconditions:** an existing identity and supported additional provider or identity evidence are available.
- **Acceptance scenarios:**
  - **Missing existing-account proof:** Given control of a new method but no required reauthentication to the existing account, when linking is requested, then it does not complete.
  - **Identifier conflict:** Given verified phone/provider identity owned by another account, when association is requested, then reassignment is stopped and safe approved resolution is required.
  - **Existing provider association:** Given a provider identity already associated with a user, when that provider is used again, then access resolves to that same internal user without creating a duplicate.
  - **Verified association:** Given the approved verification evidence for an additional method, when association is completed, then the method resolves to the intended existing identity (B/Q; reauthentication and new-method control are selected, with exact evidence/recency still open).
  - **Unverified collision:** Given matching but unverified email or phone information, when another method is presented, then the system does not automatically merge accounts or expose the existing account's records.
  - **Conflicting association:** Given a provider identity claimed by a different account, when association is requested, then no unverified reassignment occurs; the resolution route remains CLR-005.
- **Independent validation:** Use two accounts, an already-linked provider, a new verified method and an unverified collision. Require existing-account reauthentication plus new-method control. Stable identity and authorized association are success; duplicates, reassignment or disclosure are failure. Exact proof recency and assisted recovery workflow remain CLR-005.
- **Current decision traceability:** FR-009, FR-051; BR-011; CLR-005, CLR-017, CLR-021.
- **Traceability:** SRC-002; FR-007–FR-009; BR-001–BR-003; SEC-008; CLR-005.

### US-004 — End access and recover eligible account access

**Current baseline (SRC-013):** Maintain ordinary access through backend-tracked valid sessions and rotating refresh. Current-session logout is supported; logout-all, reuse-family scope and security-event effects need reviewed policy. Reset authorization lasts 5 minutes, is single-use, and is superseded by a new request; password minimum is 8 and current-password reuse is rejected.

- **Priority:** P1, proposed; account control and recovery.
- **Primary role:** account holder.
- **Capability:** logout, expired sessions, conditional password recovery. **Release:** CLR-001.
- **Dependencies:** US-002; session/recovery policy (CLR-004–CLR-005).
- **Story:** As an account holder, I want to end my session and use an approved recovery route, so that I can control continued access to my account.
- **Business value:** limits unwanted access and supports loss of credentials.
- **Preconditions:** an authenticated session for logout; password authentication enabled for password reset.
- **Acceptance scenarios:**
  - **Reset boundaries:** Given a reset sent to verified email, when authorization reaches 5 minutes, has been consumed or is superseded by a new request, then it cannot change the password.
  - **Password replacement:** Given a proposed password shorter than 8 characters or equal to the current password, when a change/reset is attempted, then it is rejected without adding an unapproved history or composition rule.
  - **Restart continuity:** Given a valid backend session and valid refresh authority, when the app restarts, then access can continue after backend validation; local credentials alone confer no access.
  - **Planned session controls:** Given reviewed logout-all or refresh-reuse revocation policy, when triggered, then the specified session scope is revoked; proposed session values or family scope are not assumed approved.
  - **Logout:** Given a valid session, when logout completes, then the appropriate authentication session is invalidated and the account is no longer represented as signed in through that session.
  - **Expired access:** Given expired authentication evidence, when a protected action is attempted, then access is rejected and the member is informed that renewed authentication is required.
  - **Password recovery, if enabled:** Given an account-recovery request, when submitted for an existing or nonexistent email, then the response does not disclose account existence. A valid short-lived, single-use reset authorization works only within its approved validity.
  - **Invalid recovery or interruption:** Given expired or reused reset authorization, or an unconfirmed interrupted recovery, when the user continues, then no unauthorized credential change or unsupported success is reported. Provider-only recovery remains CLR-005.
- **Independent validation:** Test persistent valid sessions, restart, current logout, expiry, refresh rotation/replay and interrupted outcomes. Test reset before/at/after 5 minutes, reuse, supersession, passwords below/at 8 characters and current-password rejection. Validate approved revocation scope and concurrency behavior; provisional session values cannot substitute for policy review under CLR-004–CLR-005.
- **Current decision traceability:** FR-050, FR-053–FR-054; BR-005, BR-012; CLR-004–CLR-005.
- **Traceability:** SRC-002; FR-010–FR-012; BR-004–BR-006; SEC-006–SEC-009; CLR-004–CLR-005.

### US-005 — Manage permitted family and couple relationships

**Current scope (SRC-013):** Deferred from authentication implementation by SRC-013 until relationship lifecycle/permissions are approved.

- **Priority:** P2, proposed; value depends on the launch membership model.
- **Primary role:** member authorized to manage a relationship; exact authority TBD.
- **Capability:** family/couple accounts. **Release:** CLR-001.
- **Dependencies:** US-001, US-017; relationship policy (CLR-006).
- **Story:** As a member with relationship-management permission, I want family or couple associations to reflect the approved relationship, so that participation can be managed within my permitted authority.
- **Business value:** supports grouped accounts without confusing identity or ownership.
- **Preconditions:** permitted relationship types, participant eligibility, verification and management rights have been defined.
- **Acceptance scenarios:**
  - **Valid relationship:** Given eligible participants and verified authority under the approved policy, when an allowed association is completed, then the correct people and relationship are visible to authorized viewers (D/Q).
  - **Invalid association:** Given a prohibited relationship, duplicate association or missing authorization, when submitted, then it is rejected with an appropriate outcome (Q; permitted cardinality is not invented).
  - **Access boundary:** Given a related account without permission to view another person's private information, when it requests that information, then access is denied; relationship alone does not establish authorization.
- **Independent validation:** use eligible and ineligible relationship fixtures and an approved permission matrix. Perform association and permitted viewing; verify correct participants and denied unrelated access. Fail on unauthorized disclosure or a relationship contrary to policy. Lifecycle, minors, delegated booking and benefit sharing remain blocked by CLR-006.
- **Traceability:** SRC-001, SRC-003; FR-013–FR-014; SEC-001–SEC-003; CLR-006.

### US-006 — Understand membership plans and membership entitlement

- **Priority:** P1, proposed; central product offering.
- **Primary role:** member.
- **Capability:** plans, memberships and eligibility. **Release:** CLR-001.
- **Dependencies:** US-001; membership policy (CLR-007); US-013 only if acquisition requires payment.
- **Story:** As a member, I want to understand my membership and its applicable plan, so that I know which documented benefits I can use.
- **Business value:** makes membership entitlement understandable and actionable.
- **Preconditions:** plan terms, membership states and entitlement rules are approved; a membership is assigned for membership-view scenarios.
- **Acceptance scenarios:**
  - **Membership information:** Given a membership and its approved plan terms, when an authorized member views it, then the displayed state, applicable terms and available benefits match the current membership information (D/Q).
  - **No membership:** Given no assigned membership, when membership information is requested, then an understandable empty state is shown without invented entitlement.
  - **Eligibility boundary:** Given a policy that grants or denies a specific benefit, when use is requested, then the result follows that policy (Q). An active membership is not universally required for appointments without an approved rule.
  - **Membership changes:** Given renewal, expiry or plan change only where such a lifecycle is approved, when the approved transition occurs, then entitlement reflects that transition (Q; no grace, renewal or carryover rule is specified here).
- **Independent validation:** supply approved plan/member fixtures and a policy with both permitted and denied benefit cases; compare member-visible terms and outcomes. Success means consistent information and policy outcomes. No lifecycle or eligibility test can establish product acceptance before CLR-007 is answered.
- **Traceability:** SRC-001, SRC-004, SRC-007; FR-015–FR-017; CLR-007.

### US-007 — Arrange an appointment under approved booking rules

- **Priority:** P1, proposed; principal service-access journey.
- **Primary role:** member or administrator authorized to arrange appointments; channel TBD.
- **Capability:** appointment creation. **Release:** CLR-001.
- **Dependencies:** US-001, US-017; booking policy (CLR-008); US-006, US-011 or US-013 only if the policy connects them.
- **Story:** As an authorized appointment requester, I want to arrange a permitted wellness appointment, so that the intended member can attend the scheduled offering.
- **Business value:** records an agreed service arrangement for the correct participant.
- **Preconditions:** the permitted booking actor, appointment subject, required details, time rules and confirmation meaning have been approved.
- **Acceptance scenarios:**
  - **Permitted request:** Given an eligible participant and an appointment option available under approved rules, when the authorized requester submits valid required details, then the accepted appointment identifies the correct participant, subject and scheduled time, and its outcome is shown (D/Q).
  - **Invalid or ineligible request:** Given missing details, a prohibited time or failed eligibility, when booking is attempted, then the request is rejected with a reason suitable for the requester (Q).
  - **Concurrent demand:** Given competing requests that exceed approved capacity, when processed, then accepted appointments do not exceed that capacity and unsuccessful requesters are not told they have confirmed appointments (D/Q).
  - **Repeated or interrupted submission:** Given the same logical appointment request is repeated or its outcome is interrupted, when the requester checks the result, then the proposed outcome is one accepted appointment or a clear non-success/unknown outcome, without silently duplicating the arrangement (D; FR-045; request equivalence requires CLR-008).
- **Independent validation:** use one eligible member, one ineligible case, controlled available/unavailable options and competing requests under an approved capacity policy. Success means accurate appointment associations and permitted capacity; false confirmation, wrong participant or an unintended duplicate is failure. Self-service discovery, resources and payment prerequisites are not presumed.
- **Traceability:** SRC-001, SRC-004–SRC-007; FR-018–FR-020, FR-044–FR-045; CLR-008, CLR-018.

### US-008 — Understand and, where permitted, change an appointment

- **Priority:** P2, proposed; supports continuity after arrangement.
- **Primary role:** member / authorized appointment administrator.
- **Capability:** appointment visibility and conditional changes. **Release:** CLR-001.
- **Dependencies:** US-007 fixtures; change policy (CLR-009); US-012 if related notices are enabled.
- **Story:** As an authorized appointment participant or administrator, I want accurate appointment information and any permitted change options, so that I can act on the current arrangement.
- **Business value:** reduces uncertainty about attendance and operational changes.
- **Preconditions:** an appointment exists; change scenarios additionally require approved actors, actions, deadlines and consequences.
- **Acceptance scenarios:**
  - **View appointment:** Given an appointment owned by or accessible to the user, when viewed, then its current approved details and status are shown (D).
  - **Permitted change, if enabled:** Given an allowed cancellation or reschedule under the policy, when completed, then the appointment reflects the accepted change and any approved linked effects are consistent (Q).
  - **Disallowed or conflicting change:** Given an unauthorized requester, missed deadline or unavailable replacement option, when a change is attempted, then it is not reported as successful and the current appointment remains discoverable (Q/D).
  - **Duplicate change:** Given the same change has already completed, when repeated, then the proposed business outcome remains a single change with no duplicate associated credit or payment effect (D).
- **Independent validation:** use an existing appointment and policy fixtures immediately before, at and after any approved deadline. Exercise permitted, prohibited and repeated changes. Success means accurate current details and consistent approved effects; unsupported cancellation rights or invented no-show penalties cannot be used as expected results.
- **Traceability:** SRC-001, SRC-003–SRC-007; FR-021–FR-022, FR-045–FR-046; CLR-009.

### US-009 — Record and understand wellness session participation

- **Priority:** P1, proposed; core service-delivery record.
- **Primary role:** authorized session administrator; member for permitted viewing.
- **Capability:** wellness sessions. **Release:** CLR-001.
- **Dependencies:** US-001, US-017; session meaning and lifecycle (CLR-010); US-007, US-010 and US-011 only where approved relationships exist.
- **Story:** As an authorized session administrator, I want to record the actual outcome of a wellness session, so that participation information reflects what occurred.
- **Business value:** supplies trustworthy participation information without implying clinical documentation.
- **Preconditions:** permitted session attributes, states, actors and outcome evidence are approved.
- **Acceptance scenarios:**
  - **Authorized outcome:** Given a session for a known member and a permitted outcome transition, when an authorized administrator records it, then the session shows that accepted outcome to permitted viewers (D/Q).
  - **Interrupted or failed session:** Given service delivery did not complete, when its approved outcome is recorded, then it is not represented as completed merely because an appointment existed (D/Q).
  - **Repeated completion or correction:** Given an outcome already recorded, when repeated or corrected, then only approved transition/correction rules apply and no duplicate linked effect occurs (D/Q).
  - **Unauthorized outcome:** Given a person without recording permission, when they attempt a change, then it is denied.
- **Independent validation:** supply sessions in approved starting states and users with and without recording authority. Record valid, invalid and repeated outcomes and inspect the member association and any approved credit effect. Success requires faithful outcomes and correct access; lifecycle acceptance remains blocked by CLR-010.
- **Traceability:** SRC-001, SRC-003–SRC-004, SRC-007; FR-023–FR-024, FR-045–FR-046; CLR-010, CLR-012.

### US-010 — Enroll in and understand a wellness program

- **Priority:** P2, proposed; program-led journeys may change this priority under CLR-001.
- **Primary role:** member / authorized enrollment administrator; enrollment actor TBD.
- **Capability:** wellness programs and enrollment. **Release:** CLR-001.
- **Dependencies:** US-001, US-017; program policy (CLR-011).
- **Story:** As a permitted enrollment requester, I want to enroll the intended member in an eligible wellness program, so that their program participation is recorded correctly.
- **Business value:** supports structured wellness participation.
- **Preconditions:** an approved program, its participation conditions and permitted enrollment actions exist.
- **Acceptance scenarios:**
  - **Valid enrollment:** Given an eligible participant and an available program under approved rules, when enrollment is accepted, then the program-member association and current enrollment information are available to authorized viewers (D/Q).
  - **Ineligible or missing information:** Given unmet eligibility or missing required enrollment information, when submitted, then enrollment is not falsely confirmed (Q).
  - **Repeated or incompatible enrollment:** Given a repeated submission or an existing enrollment incompatible with the policy, when submitted, then the policy's duplicate/conflict outcome applies without an unintended second enrollment (D/Q).
- **Independent validation:** use one program with approved allowed and denied participant cases and a pre-existing enrollment. Submit valid, invalid and repeated enrollments; compare the participant and enrollment outcome. Success requires the approved enrollment result. Withdrawal, completion, capacity and session allocation are not assumed.
- **Traceability:** SRC-001, SRC-004–SRC-007; FR-025–FR-026, FR-045; CLR-011.

### US-011 — Understand and apply session credits correctly

- **Priority:** P1, proposed; prevents incorrect entitlement and consumption.
- **Primary role:** member; authorized administrator for policy-permitted adjustments.
- **Capability:** session credits. **Release:** CLR-001.
- **Dependencies:** US-001, US-017; credit policy (CLR-012); relationships to membership, programs, appointments and payments remain conditional.
- **Story:** As a member, I want an accurate session-credit position and consistent credit use, so that I can understand and use my approved entitlement.
- **Business value:** protects member benefits and operational accounting of sessions.
- **Preconditions:** credit units, ownership, sources, availability and consumption events have been approved.
- **Acceptance scenarios:**
  - **Credit information:** Given a known entitlement and applicable approved credit events, when viewed, then the balance and permitted explanatory information agree with those events (D/Q).
  - **Valid use:** Given sufficient eligible credits under the policy, when the approved consumption event occurs, then exactly the policy-defined quantity is applied once to the correct owner (D/Q).
  - **Insufficient or ineligible credits:** Given zero, insufficient or policy-ineligible credits, when a credit-dependent action is requested, then the approved denial outcome applies; alternatives such as cash payment are not inferred (Q).
  - **Concurrent or repeated use:** Given competing uses of a limited entitlement or the same event repeated, when processed, then accepted uses do not exceed policy-permitted entitlement and the same event does not consume twice (D/Q).
  - **Interrupted service or cancellation:** Given a linked session or appointment changes, when the credit consequence is evaluated, then only the approved adjustment rule applies (Q; refund, release, expiration and carryover are unresolved).
- **Independent validation:** supply an approved credit policy and a known opening position with grants, consumption and any permitted adjustments. Exercise boundary, concurrent and repeated events; compare expected and visible balances. Success means exact policy-derived results. No deduction timing, expiry duration or grant source can be accepted before CLR-012.
- **Traceability:** SRC-001, SRC-004, SRC-007; FR-027–FR-029, FR-045–FR-046; CLR-012.

### US-012 — Receive relevant notifications and reminders

- **Priority:** P2, proposed; supports awareness and attendance.
- **Primary role:** member or other approved event recipient.
- **Capability:** notifications and reminders. **Release:** CLR-001.
- **Dependencies:** approved event-to-recipient/channel policy (CLR-013); originating stories as applicable.
- **Story:** As an approved recipient, I want accurate notifications and reminders about relevant events, so that I can act on current information.
- **Business value:** timely, appropriate awareness of account or service events.
- **Preconditions:** event, recipient, channel, permission and timing rules have been approved.
- **Acceptance scenarios:**
  - **Relevant event:** Given a configured event and eligible recipient, when its notification condition occurs, then the appropriate notification is attempted with information the recipient is authorized to receive (D/Q).
  - **Delivery unavailable:** Given unavailable delivery, missing contact details or denied permission, when notification is due, then the originating event is not falsely described as undone or the notification as delivered; any fallback is policy-dependent (D/Q).
  - **Changed or cancelled appointment:** Given a planned reminder whose source appointment changes, when the reminder becomes due, then the proposed notification outcome reflects current approved event rules and does not knowingly communicate obsolete appointment details (D/Q).
  - **Repeated event:** Given repeated observation of one event, when processed, then duplicate-notification policy applies; no assumed number of delivery attempts is specified (Q).
- **Independent validation:** use controlled events, authorized and unauthorized recipients, available and unavailable delivery, and changed appointments. Success means correct recipient/content and honest attempt/delivery distinction. Timing, delivery targets and duplicate tolerance remain CLR-013.
- **Traceability:** SRC-001, SRC-003, SRC-005–SRC-006; FR-030–FR-032; INT-004; CLR-013.

### US-013 — Make a payment and understand its business outcome

- **Priority:** P1, proposed; essential if launch entitlement is purchased.
- **Primary role:** authorized payer; whether payer and beneficiary may differ is unresolved.
- **Capability:** payments. **Release:** CLR-001.
- **Dependencies:** approved payable items, payer rules and confirmation policy (CLR-014); US-006, US-010 or US-011 only for approved purchases.
- **Story:** As an authorized payer, I want to know the confirmed outcome of my payment and the associated purchase, so that I understand whether payment and fulfillment have completed.
- **Business value:** trustworthy commercial outcomes and entitlement handling.
- **Preconditions:** an approved payable item, amount, currency, beneficiary and payment route are established.
- **Acceptance scenarios:**
  - **Confirmed payment:** Given an authorized payment for a valid item, when the payment outcome is verified, then the payment information reflects that outcome and fulfillment follows the approved purchase policy (D/Q).
  - **Rejected or awaiting confirmation:** Given a rejected payment or one without final confirmation, when the payer checks it, then it is not represented as confirmed successful and unknown outcomes are distinguishable from definitive failure (D/Q).
  - **Duplicate submission or repeated external confirmation:** Given the same logical payment is submitted or reported repeatedly, when processed, then the proposed outcome is no duplicate recorded charge or entitlement arising from repetition (D; payment equivalence and provider guarantees require CLR-014).
  - **Payment succeeded, fulfillment incomplete:** Given confirmed payment but unsuccessful membership activation or other fulfillment, when its outcome is presented, then confirmed payment and incomplete fulfillment remain distinguishable; no automatic refund is inferred (D/Q).
- **Independent validation:** use approved purchase fixtures and controlled confirmed, rejected, indeterminate, delayed and repeated external outcomes. Success means truthful payment status and exactly the approved fulfillment consequence. Wrong beneficiary, false success or duplicate business effect is failure; recovery ownership remains CLR-014–CLR-015.
- **Traceability:** SRC-001, SRC-005–SRC-007; FR-033–FR-035, FR-045–FR-046; SEC-010; INT-005; CLR-014–CLR-015.

### US-014 — Understand billing and transaction information

- **Priority:** P2, proposed; billing detail supports financial transparency.
- **Primary role:** authorized member / billing administrator.
- **Capability:** billing and transactions. **Release:** CLR-001.
- **Dependencies:** US-013 fixtures; billing access and document policy (CLR-015).
- **Story:** As an authorized account holder, I want to review my permitted billing and transaction information, so that I can understand recorded charges and payment outcomes.
- **Business value:** makes recorded commercial activity understandable.
- **Preconditions:** allowed billing fields, viewer/beneficiary permissions and transaction categories are approved.
- **Acceptance scenarios:**
  - **Recorded activity:** Given billing and transaction activity visible to the user, when reviewed, then amounts, currencies and outcomes agree with the confirmed business records (D/Q).
  - **No activity:** Given no permitted records, when reviewed, then an understandable empty state is shown.
  - **Unauthorized activity:** Given another person's transaction without delegated permission, when requested, then access is denied.
  - **Corrections or reversals, if enabled:** Given an approved correction/refund policy, when an allowed adjustment completes, then its effect is accurately reflected without disguising an unresolved payment (Q). Invoice issuance, taxes and refund entitlement are not assumed.
- **Independent validation:** supply known transactions and two account owners. Compare permitted displayed information to the known records, including no activity and approved adjustments. Success means accurate information and access; document/tax/refund-specific outcomes remain blocked by CLR-015.
- **Traceability:** SRC-001, SRC-003, SRC-005, SRC-007; FR-036–FR-037; CLR-015.

### US-015 — Access a digital wellness passport

**Current scope (SRC-013):** Advanced passport/progress functionality is deferred from authentication implementation; prior broad Phase 1 proposal is superseded.

- **Priority:** P2, proposed; consolidated wellness information has value once its purpose is agreed.
- **Primary role:** member; delegated viewers only if approved.
- **Capability:** digital wellness passport. **Release:** CLR-001.
- **Dependencies:** US-001, US-017; passport definition (CLR-016); contributing capabilities only if approved.
- **Story:** As a member, I want to access my defined wellness passport information, so that I can understand the wellness information the product makes available to me.
- **Business value:** provides the constitution-named passport capability without assuming medical or clinical content.
- **Preconditions:** passport purpose, information set, source ownership and viewer permissions are approved.
- **Acceptance scenarios:**
  - **Available information:** Given approved passport information for the member, when accessed, then the permitted content relates to that member and agrees with its authoritative business information (D/Q).
  - **No information:** Given no qualifying information, when accessed, then the member sees an understandable empty state rather than fabricated history.
  - **Restricted information:** Given another member's passport without delegated permission, when accessed, then the request is denied.
- **Independent validation:** provide a member with a known approved passport information set, one without it and an unauthorized viewer. Success means correct content, clear absence and denied unauthorized access. Essential passport semantics remain unknown; no export, sharing, measurements or clinical records are committed by this story.
- **Traceability:** SRC-001, SRC-003, SRC-005–SRC-007; FR-038–FR-039; CLR-016.

### US-016 — Perform authorized administrative operations

- **Priority:** P1, proposed; essential for the selected operational model.
- **Primary role:** authorized administrative user; specializations TBD.
- **Capability:** administrative operations. **Release:** CLR-001.
- **Dependencies:** US-002, US-017; approved action matrix (CLR-017); relevant business policies.
- **Story:** As an authorized administrator, I want to carry out permitted operational actions, so that member and service operations can be maintained accurately.
- **Business value:** supports the constitution's administrative scope without granting unrestricted powers.
- **Preconditions:** a reviewed list of administrative actions, authority and business validations exists.
- **Acceptance scenarios:**
  - **Permitted operation:** Given a permitted administrative action on a permitted subject, when valid information is submitted, then the accepted outcome is reflected in the relevant business information (D/Q).
  - **Forbidden action:** Given an administrator without the specific required authority, when the action is attempted, then it is denied even though the user has an administrative role.
  - **Invalid or conflicting change:** Given a change that violates a business rule or conflicts with a concurrent accepted change, when submitted, then the system does not silently report an inconsistent outcome (D/Q; conflict resolution remains CLR-017).
  - **Interrupted operation:** Given an operation without a confirmed result, when the administrator returns, then success is not asserted without confirmation; a proposed recoverable outcome identifies the operation's known result or uncertainty (D).
- **Independent validation:** supply an approved action matrix with one permitted and one prohibited operation per actual role and controlled business fixtures. Success requires correct business effects and consistent denials. No plan editor, credit adjustment, refund, operator schedule, equipment editor or reporting power is assumed from the label “administrator.”
- **Traceability:** SRC-001, SRC-003–SRC-007; FR-040–FR-046; CLR-017.

### US-017 — Keep protected information and operations within authorized access

**Current scope (SRC-013):** Selected roles are MEMBER, OPERATOR and ADMIN; public registration grants MEMBER only, pending members cannot access protected member features, and production action/ownership grants still require approval.

- **Priority:** P1, proposed; mandatory constitutional protection.
- **Primary role:** member / administrator as protected-resource owner or authorized user.
- **Capability:** role-based access and privacy. **Release:** CLR-001.
- **Dependencies:** identity (US-002–US-003); ownership and role definitions (CLR-006, CLR-017).
- **Story:** As an account holder, I want my protected information and operations accessible only to authorized users, so that account use respects identity, ownership and granted permissions.
- **Business value:** prevents unauthorized personal-data access and business changes.
- **Preconditions:** protected resources and their approved permission rules are defined; no authenticated session is needed to test denial of anonymous access.
- **Acceptance scenarios:**
  - **Permitted access:** Given valid authentication and sufficient permission for the requested subject and action, when requested, then the permitted operation can proceed subject to its business rules.
  - **Anonymous or expired access:** Given absent, invalid or expired authentication, when a protected operation is requested, then it is denied without exposing protected data.
  - **Wrong owner or role:** Given an authenticated user without ownership or delegated permission, when another member's resource or an administrative action is requested, then it is denied.
  - **Forged privilege:** Given user-supplied claims of a privileged role or another person's identity, when the action is requested, then those claims alone do not grant permission.
- **Independent validation:** use anonymous access, member A, member B and administrators with differing approved permissions. Exercise reads and changes on each protected capability. Success means permitted access only and no unauthorized state change or sensitive disclosure. Unknown role definitions block matrix completeness, not the obligation to deny unauthorized access.
- **Traceability:** SRC-002–SRC-003, SRC-006; FR-042; SEC-001–SEC-003, SEC-010–SEC-012; CLR-017, CLR-021.

## 3. Edge Cases

Each row defines the trigger, affected behavior, expected system outcome, visible outcome and clarification status. D/Q outcomes retain the classifications in Section 1. Open policy choices are explicitly unresolved; the absence of a rule is not permission to create a default. Every row also inherits CLR-001 for release assignment.

### 3.A Input validation

| ID | Trigger | Related story / requirement | Expected system behavior | Expected user-visible outcome | Status |
| --- | --- | --- | --- | --- | --- |
| EC-001 | Required value missing or empty | US-001, US-007; FR-043 | Reject input against the approved required-field definition | Clear validation failure identifying a permissible correction | C/Q; field definitions CLR-002, CLR-008 |
| EC-002 | Invalid type, date, identifier, numeric value or unsupported enumeration | US-001, US-006–US-011; FR-043 | Reject the invalid operation; enforce business-critical validation consistently | Understandable validation outcome without internal details | C/Q; capability-specific policy |
| EC-003 | Input at, below or above a length/numeric/date boundary | US-001; FR-043 | Accept or reject according to the approved inclusive/exclusive bounds | No silent truncation or false acceptance is proposed | C/D/Q; bounds CLR-002 |
| EC-004 | Duplicate contact data, inconsistent person information or differently formatted equivalent contact values | US-001, US-003; FR-008–FR-009 | Normalize where appropriate; do not infer identity from unverified matches | Safe conflict/verification outcome without disclosing another account | C/Q; CLR-005 |

### 3.B Authentication and access

| ID | Trigger | Related story / requirement | Expected system behavior | Expected user-visible outcome | Status |
| --- | --- | --- | --- | --- | --- |
| EC-005 | Invalid password or invalid provider identity evidence | US-002; FR-004, FR-006; SEC-004, SEC-008 | Do not establish authenticated access | Appropriate sign-in failure without sensitive details | C, conditional on method enablement; CLR-003 |
| EC-006 | Wrong, expired or already-used OTP | US-002; FR-005; SEC-005 | Reject verification; a consumed code remains unusable | Verification failure and only approved recovery options | C/Q; lifetime and limits CLR-004 |
| EC-007 | Repeated login, OTP generation or verification attempts | US-002; SEC-007 | Apply approved abuse controls; do not bypass verification | Restriction communicated without enumerating accounts | C/Q; thresholds CLR-004 |
| EC-008 | Expired, invalid or logged-out session used for protected access | US-004, US-017; FR-010–FR-011 | Reject access under session-validity rules | Authentication-required outcome | C/Q; multi-device/termination scope CLR-004 |
| EC-009 | Password reset for unknown email; expired/reused reset authorization | US-004; FR-012; SEC-006 | Avoid disclosing account existence; deny invalid reset authorization | Non-enumerating request response; understandable invalid-reset outcome | C/Q; CLR-004–CLR-005 |
| EC-010 | Same person uses another provider; provider already associated elsewhere | US-003; FR-007–FR-009 | Preserve existing verified identity; no unverified merge or reassignment | Verification/conflict outcome; no foreign data disclosure | C/Q; CLR-005 |
| EC-011 | Apple private relay email or changed contact details | US-002–US-003; FR-006–FR-008 | Use verified identity association rather than treating email as identity proof | Continued correct account access where identity verifies | C/Q; enablement and contact-change policy CLR-003, CLR-005 |
| EC-012 | Another member's information or administrative action requested without permission | US-017; FR-042; SEC-001–SEC-003 | Deny access and prevent the unauthorized change | Authorization failure without protected content | C; full matrix CLR-017 |
| EC-013 | Account restriction or security-sensitive account change | US-004, US-017; SEC-009 | Follow an approved account/session restriction policy if introduced; do not invent suspension states | Accurate restricted or reauthentication outcome once policy exists | Q; CLR-004–CLR-005 |

### 3.C Membership and account management

| ID | Trigger | Related story / requirement | Expected system behavior | Expected user-visible outcome | Status |
| --- | --- | --- | --- | --- | --- |
| EC-014 | No membership, or a membership state that may restrict a requested benefit | US-006–US-007; FR-015–FR-017 | Apply only documented membership/benefit conditions | Current membership information and permitted eligibility explanation | D/Q; CLR-007; inactive, expired and suspended are not assumed states |
| EC-015 | Membership renewal or plan change affects an existing appointment, program or credit | US-006, US-008, US-010–US-011; FR-017, FR-046 | Apply approved cross-capability transition effects | Consistent affected information; no inferred cancellation or credit forfeiture | Q; CLR-007, CLR-009, CLR-012 |
| EC-016 | Invalid family/couple association, duplicate person or unauthorized relationship change | US-005; FR-013–FR-014 | Reject prohibited association; preserve individual identity and permission boundaries | Relationship failure without unauthorized profile disclosure | D/Q; CLR-006 |
| EC-017 | Related account requests delegated booking, pooled credits or another person's profile | US-005, US-007, US-011, US-017; FR-014, FR-042 | Allow only explicitly granted authority and benefit-sharing rules | Permitted result or access/eligibility denial | C/Q; CLR-006; relationship alone grants no unspecified right |

### 3.D Appointments and availability

| ID | Trigger | Related story / requirement | Expected system behavior | Expected user-visible outcome | Status |
| --- | --- | --- | --- | --- | --- |
| EC-018 | Fully booked option or simultaneous demand beyond approved capacity | US-007; FR-020 | Accept only capacity-permitted appointments | Confirmation only for accepted requests; unavailable outcome otherwise | D/Q; capacity CLR-008 |
| EC-019 | Past/prohibited date, boundary time, timezone ambiguity or outside permitted hours | US-007; FR-019, FR-043 | Validate against approved date/time and operating policy | Unambiguous scheduled time or correction outcome | Q; CLR-008; no horizon, timezone or hours assumed |
| EC-020 | Unavailable operator/equipment or conflicting resource allocation | Candidate capability; US-007 only if adopted | No committed resource behavior; if adopted, specify capacity/resource conflict outcomes before approval | NEEDS CLARIFICATION; no invented resource guarantee | Scope unknown; CLR-018 |
| EC-021 | Repeated submission or interruption after appointment acceptance | US-007; FR-044–FR-045 | Proposed: expose the known outcome and avoid an unintended duplicate | Existing accepted appointment, non-success or honest uncertainty | D/Q; logical-request definition CLR-008 |
| EC-022 | Cancellation/reschedule near a deadline or replacement becoming unavailable | US-008; FR-022, FR-046 | Apply approved changes and linked consequences only | Current appointment and accurate change result | Q; CLR-009 |
| EC-023 | Missed appointment or booking/attendance after a membership boundary | US-006–US-009; FR-017, FR-022–FR-024 | Use approved attendance and eligibility-at-time rules | Recorded outcome without invented penalty or deduction | Q; CLR-007, CLR-009–CLR-010 |

### 3.E Session credits and wellness programs

| ID | Trigger | Related story / requirement | Expected system behavior | Expected user-visible outcome | Status |
| --- | --- | --- | --- | --- | --- |
| EC-024 | Zero, insufficient or policy-ineligible credits | US-011; FR-028 | Apply approved eligibility and consumption policy | Accurate balance and policy-based denial where applicable | Q; CLR-012; no negative-balance or alternate-payment rule assumed |
| EC-025 | Credit expiration, grant or rollover boundary | US-011; FR-027–FR-029 | No expiry, source or rollover behavior is established until approved | Balance must be explainable using the eventual policy | Q; CLR-012 |
| EC-026 | Same session/credit event repeated or competing use of remaining entitlement | US-009, US-011; FR-028–FR-029, FR-045 | Proposed: one policy-permitted effect per logical event; no excess permitted consumption | Consistent remaining balance and denied conflicting use | D/Q; CLR-010, CLR-012 |
| EC-027 | Cancellation after allocation, interrupted session or failed completion | US-008–US-009, US-011; FR-022, FR-024, FR-046 | Apply only approved reservation/consumption/reversal relationships, if any | Correct appointment/session outcome and explainable credit consequence | Q; CLR-009–CLR-010, CLR-012 |
| EC-028 | Balance differs from accepted events or membership/program change | US-006, US-010–US-011; FR-027–FR-029 | Proposed: do not present a known discrepancy as a settled balance; apply approved correction authority | Accurate result or identified unresolved inconsistency | D/Q; reconciliation/correction CLR-012, CLR-017 |
| EC-029 | Duplicate, ineligible or conflicting program enrollment | US-010; FR-025–FR-026 | Apply approved eligibility and enrollment uniqueness/capacity rules | Accepted enrollment or clear rejection | D/Q; CLR-011 |

### 3.F Payments and billing

| ID | Trigger | Related story / requirement | Expected system behavior | Expected user-visible outcome | Status |
| --- | --- | --- | --- | --- | --- |
| EC-030 | Rejected payment or external timeout | US-013; FR-033–FR-034; INT-005 | Do not assert confirmed success; distinguish known rejection from unknown result | Accurate non-success or awaiting-confirmation outcome | D/Q; CLR-014 |
| EC-031 | Delayed confirmation, pending result or conflicting external reports | US-013–US-014; FR-034–FR-036 | Resolve status according to approved evidence precedence; do not invent a final outcome | Confirmed outcome or explicit uncertainty | D/Q; CLR-014–CLR-015 |
| EC-032 | Duplicate payment submission or repeated provider notification | US-013; FR-035, FR-045 | Proposed: no duplicated recorded charge or benefit from repetition | One logical payment outcome with consistent benefit | D/Q; logical-payment and correction policy CLR-014 |
| EC-033 | Successful payment but interrupted return or failed membership activation | US-006, US-013; FR-034–FR-035, FR-044 | Preserve distinction between confirmed payment and incomplete fulfillment | Paid-but-unfulfilled outcome where supported by evidence, not false failure/success of the whole journey | D/Q; ownership and resolution timing CLR-014–CLR-015 |
| EC-034 | Refund, reversal, disputed amount, invoice or tax question | US-014; FR-037 | No refund entitlement, tax calculation or invoice rule exists until approved | Only verified financial information and approved actions | Q; CLR-015 |

### 3.G Notifications

| ID | Trigger | Related story / requirement | Expected system behavior | Expected user-visible outcome | Status |
| --- | --- | --- | --- | --- | --- |
| EC-035 | Missing contact details, permissions disabled or delivery failure | US-012; FR-030–FR-032; INT-004 | Distinguish recorded event, attempted notification and confirmed delivery where evidence exists | No false delivered claim; fallback only if approved | D/Q; CLR-013 |
| EC-036 | Repeated event or delayed reminder | US-012; FR-030–FR-031 | Apply approved duplicate and lateness rules | No knowingly inaccurate event information | D/Q; CLR-013 |
| EC-037 | Appointment cancelled/changed after reminder scheduled | US-008, US-012; FR-022, FR-032 | Proposed: notification reflects current approved event policy | No obsolete reminder represented as a current appointment | D/Q; CLR-009, CLR-013 |
| EC-038 | Incorrect recipient, changed contact or related member without permission | US-005, US-012, US-017; FR-030; SEC-002 | Prevent unauthorized disclosure; follow verified recipient and content rules | Notification only to permitted recipient with permitted content | C/Q; CLR-005–CLR-006, CLR-013 |

### 3.H External services and operational failures

| ID | Trigger | Related story / requirement | Expected system behavior | Expected user-visible outcome | Status |
| --- | --- | --- | --- | --- | --- |
| EC-039 | Network loss, timeout or temporary service unavailability | All stories; FR-044; NFR-001, NFR-004 | Show the known state without asserting unconfirmed success; proposed recovery preserves known completed outcomes | Clear loading, failure or uncertain outcome with an approved next action | C/D/Q; recovery commitments CLR-022 |
| EC-040 | Interrupted app session followed by repeated business action | US-001, US-007–US-014, US-016; FR-044–FR-045 | Proposed: repeated logical action does not create unintended duplicate effects | Discoverable known result or explicit uncertainty | D/Q; capability equivalence rules and CLR-022 |
| EC-041 | Two authorized users make conflicting changes | US-005–US-011, US-016; FR-046 | Preserve applicable business constraints; use approved conflict/correction authority | Accepted current information or a clear conflict outcome | C/D/Q; CLR-017 |
| EC-042 | A linked operation completes only partly | US-006–US-014; FR-046; NFR-003 | Preserve integrity of operations defined as inseparable; show separately confirmed external effects honestly | No misleading claim that all related outcomes completed | C/D/Q; linked-operation definitions CLR-007–CLR-015 |
| EC-043 | Large history, no records or unavailable source information | US-006, US-008, US-011, US-014–US-015; NFR-001–NFR-002 | Provide manageable access and distinguish an empty result from inability to obtain it | Understandable records, empty state or failure state | C/D; volume and performance CLR-022 |
| EC-044 | Private information or authentication/payment secrets appear in errors or operational records | US-002, US-013, US-017; SEC-010–SEC-011 | Do not expose secrets, sensitive logs or internal exception details | Safe failure information without sensitive content | C; privacy categories/retention CLR-021 |
| EC-045 | A supported screen configuration, system text scaling or visible keyboard affects required information or controls | All selected stories; NFR-007 | Accommodate the supported configuration and interactions so that required information and actions remain usable | Readable, reachable content, inputs and completion controls; no blocked essential action | U; exact screen, scaling and keyboard coverage remains CLR-020 |
| EC-046 | A journey fails on a representative Android or iOS configuration, or minimum OS support is not agreed | All selected stories; NFR-006; SC-012 | Treat the result or missing support boundary as an unresolved acceptance condition; do not silently omit a platform | Required journey remains an obligation on both platforms; acceptance identifies the gap instead of claiming unsupported compatibility | U/Q; CLR-020; exclusion requires explicit approval |

### 3.I Consolidated account/session boundaries

| ID | Trigger | Related story / requirement | Expected system behavior | Expected user-visible outcome | Status |
| --- | --- | --- | --- | --- | --- |
| EC-047 | Primary authentication succeeds but mandatory phone/email verification remains incomplete | US-001, US-017; FR-047–FR-049 | Restrict to allowed registration/verification/recovery | Explain remaining verification; no protected member features | U/B; SRC-013 |
| EC-048 | Verified phone already belongs to another member or requires recycled-number recovery | US-001, US-003; FR-051 | Stop reassignment/merge and require approved recovery | Safe conflict without foreign disclosure | B/Q; CLR-005 |
| EC-049 | Twilio approval occurs but local completion/response fails | US-001–US-002; FR-005 | Recover using trusted evidence and no duplicate local effect; no false local success | Incomplete or uncertain result | B/Q; CLR-004, CLR-024 |
| EC-050 | Proposed session cap/inactivity limit or refresh reuse is reached | US-004; FR-053–FR-054 | Apply reviewed scope/race policy, not invented eviction or grace | Accurate renewed-sign-in/session outcome | P/Q; CLR-004 |
| EC-051 | Non-Indian E.164 number is presented in India operating scope | US-001; FR-008 | Use explicit country eligibility policy rather than assuming +91-only from the market | Allowed/rejected outcome once policy is defined | Q; CLR-002 |

## 4. Functional Requirements

### 4.1 Identity, authentication and profiles

| ID | Requirement | Evidence / status | Stories / decisions |
| --- | --- | --- | --- |
| FR-001 | The system shall allow self-service member registration, completed only after required verification and approved minimum profile information. | SRC-002, SRC-013; U/B; fields Q | US-001; CLR-002; FR-047–FR-049 |
| FR-002 | The system shall allow an authorized member to retrieve and maintain the profile information designated as member-manageable. | SRC-001, SRC-003; D/Q | US-001; CLR-002 |
| FR-003 | The system shall retain email/password, phone OTP, Google and Apple as supported member methods, activated only with valid platform/provider configuration and permitted role access. | SRC-002, SRC-013; U/B | US-002; CLR-003 |
| FR-004 | The system shall grant password-based account access only after successful verification of valid credentials when that method is enabled. | SRC-002; C/Q | US-002; CLR-003–CLR-004 |
| FR-005 | The system shall accept phone verification/sign-in only after backend-mediated Twilio Verify confirmation for the intended member, phone and purpose within reviewed controls. | SRC-002, SRC-013; U/B; constitutional reconciliation open | US-001–US-002; CLR-004, CLR-024 |
| FR-006 | The system shall establish Google or Apple sign-in identity only from verified evidence issued for the intended application and within its validity, including correct handling of Apple private relay email where applicable. | SRC-002; C/Q | US-002; CLR-003 |
| FR-007 | The system shall resolve an already-associated authentication-provider identity to the same unique internal user without creating a duplicate account. | SRC-002; C | US-002–US-003 |
| FR-008 | The system shall normalize phone numbers to E.164 and validate/normalize email consistently without treating format validity as proof of control. | SRC-002, SRC-013; C/U/B | US-001, US-003; CLR-002, CLR-005 |
| FR-009 | The system shall link an additional method only after reauthentication to the existing account and proof of control of the new method, without unverified merging. | SRC-002, SRC-013; C/U/B | US-003; CLR-005 |
| FR-010 | The system shall allow current-session logout and invalidate that backend session and its continued-access authority. | SRC-002, SRC-013; C/U/B | US-004; races CLR-004 |
| FR-011 | The system shall reject expired authentication evidence for protected access. | SRC-002; C | US-004, US-017; expiration values CLR-004 |
| FR-012 | The system shall deliver reset authorization to verified email, valid for 5 minutes and one use, superseded by a new reset request, without revealing account existence. | SRC-002, SRC-013; C/U/B | US-004; delivery/session effects CLR-004–CLR-005 |

### 4.2 Family, couple and membership management

| ID | Requirement | Evidence / status | Stories / decisions |
| --- | --- | --- | --- |
| FR-013 | The system shall represent permitted family and couple account associations between the correct participants under the approved relationship policy. | SRC-001; D/Q | US-005; CLR-006 |
| FR-014 | The system shall restrict actions on another related member's account to explicitly authorized relationship permissions. | SRC-003; C/Q | US-005, US-017; CLR-006 |
| FR-015 | The system shall make the applicable approved membership-plan terms available to authorized members. | SRC-001; D/Q | US-006; CLR-007 |
| FR-016 | The system shall show an authorized member the current information for their membership according to the approved membership lifecycle. | SRC-001; D/Q | US-006; CLR-007 |
| FR-017 | The system shall determine a requested membership benefit's eligibility from the approved membership rules at the policy-defined decision time. | SRC-001, SRC-004; D/Q | US-006–US-008, US-011; CLR-007 |

### 4.3 Appointments, sessions, programs and credits

| ID | Requirement | Evidence / status | Stories / decisions |
| --- | --- | --- | --- |
| FR-018 | The system shall record an accepted appointment for the intended member, appointment subject and scheduled time through the approved booking route. | SRC-001; D/Q | US-007; CLR-008 |
| FR-019 | The system shall accept an appointment request only if its required participant, offering and time conditions satisfy the approved booking rules. | SRC-001, SRC-004; D/Q | US-007; CLR-007–CLR-008 |
| FR-020 | The system shall limit accepted appointments to the approved availability and capacity, including when requests compete. | SRC-004, SRC-007; D/Q | US-007; CLR-008; resource scope CLR-018 |
| FR-021 | The system shall allow authorized users to view current appointment information for appointments they may access. | SRC-001, SRC-003; D | US-008; field/lifecycle details CLR-008–CLR-009 |
| FR-022 | The system shall apply only those appointment changes and resulting consequences authorized by the approved appointment-change policy, if such changes are enabled. | SRC-001, SRC-004; D/Q | US-008; CLR-009 |
| FR-023 | The system shall allow the approved session-recording role to record wellness participation outcomes against the correct member and session. | SRC-001; D/Q | US-009; CLR-010, CLR-017 |
| FR-024 | The system shall represent session outcomes according to the approved session lifecycle, including its rules for interrupted delivery and corrections. | SRC-001, SRC-004; D/Q | US-009; CLR-010 |
| FR-025 | The system shall enroll the intended member in a wellness program only under the approved enrollment conditions and authority. | SRC-001, SRC-003–SRC-004; D/Q | US-010; CLR-011 |
| FR-026 | The system shall make approved program participation information available to users authorized to view the member's enrollment. | SRC-001, SRC-003; D/Q | US-010; CLR-011 |
| FR-027 | The system shall show an authorized member the session-credit position calculated from their approved entitlement and applicable credit events. | SRC-001, SRC-007; D/Q | US-011; CLR-012 |
| FR-028 | The system shall apply credit changes only for the policy-defined grant, consumption or adjustment events and in the policy-defined quantity. | SRC-001, SRC-004; D/Q | US-011; CLR-012 |
| FR-029 | The system shall preserve the approved credit-entitlement limits when credit events are repeated or compete for the same remaining entitlement. | SRC-004, SRC-007; D/Q | US-011; CLR-012 |

### 4.4 Notifications, payments and billing

| ID | Requirement | Evidence / status | Stories / decisions |
| --- | --- | --- | --- |
| FR-030 | The system shall attempt notifications and reminders only for the approved events, recipients, permitted content, channels and timing. | SRC-001, SRC-003; D/Q | US-012; CLR-013 |
| FR-031 | The system shall distinguish a recorded business event, a notification attempt and verified delivery whenever it reports those outcomes. | SRC-005; D | US-012; available delivery evidence CLR-013 |
| FR-032 | The system shall apply approved reminder-change rules when the source appointment or other relevant event changes before delivery. | SRC-001, SRC-005; D/Q | US-008, US-012; CLR-009, CLR-013 |
| FR-033 | The system shall allow an authorized payer to initiate payment for an approved payable item, amount, currency and beneficiary. | SRC-001; D/Q | US-013; CLR-014 |
| FR-034 | The system shall represent a payment's outcome according to verified payment information without presenting an unconfirmed result as confirmed success. | SRC-001, SRC-005, SRC-007; D/Q | US-013–US-014; CLR-014 |
| FR-035 | The system shall apply the approved fulfillment consequence of a confirmed payment to the correct beneficiary once per logical purchase. | SRC-001, SRC-007; D/Q | US-006, US-013; CLR-014 |
| FR-036 | The system shall allow authorized viewers to review their permitted billing and transaction information consistent with the recorded financial outcomes. | SRC-001, SRC-003, SRC-007; D/Q | US-014; CLR-015 |
| FR-037 | The system shall reflect approved financial corrections or reversals in billing and transaction information if those operations are included in the approved scope. | SRC-001, SRC-007; D/Q | US-014; CLR-015 |

### 4.5 Passport, administration and shared business outcomes

| ID | Requirement | Evidence / status | Stories / decisions |
| --- | --- | --- | --- |
| FR-038 | The system shall allow a member to access their approved digital wellness passport information. | SRC-001; D/Q | US-015; CLR-016 |
| FR-039 | The system shall keep displayed passport information consistent with the approved contributing business information for that member. | SRC-001, SRC-007; D/Q | US-015; CLR-016 |
| FR-040 | The system shall allow an authorized administrator to perform each approved administrative action within that role's permitted subjects and business rules. | SRC-001, SRC-003; D/Q | US-016; CLR-017 |
| FR-041 | The system shall allow authorized administrators to inspect the operational information needed for their approved actions. | SRC-001, SRC-003; D/Q | US-016; CLR-017; does not approve reporting |
| FR-042 | The system shall deny protected resource access and operations unless the authenticated user has the required role and applicable ownership or delegated permission. | SRC-002–SRC-003; C | US-017 and every protected story; matrix CLR-006, CLR-017 |
| FR-043 | The system shall reject user input that fails approved required-field, type, length, identifier, date, numeric, enumeration or business-constraint validation. | SRC-004; C/Q | US-001, US-005–US-016; capability field/policy clarifications |
| FR-044 | The system shall communicate the known outcome of a user operation, distinguishing loading, accepted success, absence of information, denied access, failure and an unconfirmed result as applicable. | SRC-005; C for explicit states, D for unconfirmed-outcome recovery | All stories; CLR-022 |
| FR-045 | The system shall prevent repetition of the same logical business action from unintentionally creating duplicate accepted effects. | SRC-007; D/Q | US-001, US-005–US-014, US-016; equivalence rules CLR-002, CLR-006–CLR-015, CLR-017 |
| FR-046 | The system shall preserve consistency among business changes required to succeed or fail together under the approved business policy. | SRC-007; C/Q | US-006–US-014, US-016; inseparable relationships require the relevant policy decision |

### 4.5.1 Consolidated authentication obligations

| ID | Requirement | Evidence / status | Stories / decisions |
| --- | --- | --- | --- |
| FR-047 | The system shall require verified phone ownership before completing every new member registration, including social registration. | SRC-013; U | US-001–US-002; CLR-002–CLR-004, CLR-024 |
| FR-048 | The system shall additionally require verified email for email/password registration. | SRC-013; U | US-001–US-002; CLR-002–CLR-003 |
| FR-049 | The system shall restrict pending-verification members to permitted registration, verification and recovery flows until completion. | SRC-013; B | US-001, US-017; CLR-002 |
| FR-050 | The system shall reject passwords shorter than 8 characters and replacement with the current password; additional composition/history rules require approval. | SRC-013; U | US-002, US-004; CLR-004 |
| FR-051 | The system shall allow a verified phone to authenticate one member account unless a shared-number exception is expressly approved. | SRC-013; B | US-001, US-003; CLR-005 |
| FR-052 | The system shall grant only MEMBER through public registration; OPERATOR and ADMIN require controlled authorized provisioning. | SRC-013; B | US-001, US-017; CLR-017 |
| FR-053 | The system shall maintain ordinary signed-in continuity across restarts through valid backend-tracked sessions and rotating revocable refresh credentials. | SRC-013; B; parameters P/Q | US-004; CLR-004 |
| FR-054 | The system shall support planned logout-all-devices only with reviewed UX and revocation policy; this does not replace current-session logout. | SRC-013; B/Q | US-004; CLR-004 |

### 4.6 Business rules

Rules are supported by the constitution or the classified consolidated decisions. Detailed membership, booking, credit, renewal, cancellation, rescheduling, payment, operator and equipment rules are **not established**; their questions are in CLR-006–CLR-018. Proposed duplicate-effect handling remains FR-045, not an invented approved business rule.

| ID | Rule | Source / status | Related obligations |
| --- | --- | --- | --- |
| BR-001 | Each authenticated user has one unique internal identity; provider identities are associated sign-in identities, not replacements for that identity. | SRC-002; C | US-002–US-003; FR-007; SEC-001 |
| BR-002 | An already-associated provider identity must not create another internal user on repeat authentication. | SRC-002; C | US-002–US-003; FR-007 |
| BR-003 | Account association requires secure verification; matching unverified information alone never authorizes automatic account merging. | SRC-002; C | US-003; FR-008–FR-009 |
| BR-004 | An OTP is short-lived and usable only once; successful verification invalidates it. Exact duration and attempt limits remain CLR-004. | SRC-002; C/Q | US-002; FR-005; SEC-005 |
| BR-005 | Reset authorization expires after 5 minutes, is single-use and is invalidated by a new reset request; requests do not enumerate accounts. | SRC-002, SRC-013; C/U/B | US-004; FR-012; SEC-006 |
| BR-006 | Authentication expires; expired evidence cannot authorize protected access. Logout invalidates the appropriate session. | SRC-002; C/Q | US-004; FR-010–FR-011; SEC-009 |
| BR-007 | Authentication alone does not confer authorization; administrative and ownership-sensitive actions require the applicable permissions. | SRC-002–SRC-003; C | US-005, US-016–US-017; FR-014, FR-040–FR-042 |
| BR-008 | Security-sensitive and business-critical input is subject to authoritative validation regardless of what the user-facing application accepts. | SRC-004; C | US-001, US-005–US-016; FR-043 |
| BR-009 | Every new member verifies phone; email/password also verifies email. Pending members have no protected member-feature access. | SRC-013; U/B | US-001, US-017; FR-047–FR-049 |
| BR-010 | Initial members authenticate independently; family delegation and shared credentials are not implied. | SRC-013; U/B | US-005, US-017; FR-014, FR-042 |
| BR-011 | Verified phone is unique to one member authentication account unless an exception is approved; it is not the internal identity. | SRC-013; B | US-001, US-003; FR-051 |
| BR-012 | Password minimum is 8; the current password cannot be reused as its replacement. No longer history rule is approved. | SRC-013; U | US-002, US-004; FR-050 |

### 4.7 Security and access requirements

These describe outcomes. Constitution-specific authentication and engineering mechanisms remain binding by reference and are not redesigned here.

| ID | Required security outcome | Source / status | Traceability / unresolved detail |
| --- | --- | --- | --- |
| SEC-001 | The system shall establish protected access from verified identity and valid authentication; a user-supplied assertion of identity is insufficient. | SRC-002; C | US-002–US-004, US-017; FR-003–FR-011, FR-042 |
| SEC-002 | The system shall enforce ownership and approved delegated permissions for personal, membership, appointment, session, credit, financial and passport information wherever those resources are present. | SRC-003, SRC-006; C | US-005–US-017; FR-014, FR-042; CLR-006, CLR-017 |
| SEC-003 | The system shall enforce least privilege for administrative actions and reject user-supplied role claims as permission evidence. | SRC-003, SRC-006; C | US-016–US-017; FR-040–FR-042; CLR-017 |
| SEC-004 | The system shall protect password credentials against plaintext storage or disclosure and grant no access on failed password verification. | SRC-002, SRC-006; C/Q | US-002; FR-004; enablement/policy CLR-003–CLR-004 |
| SEC-005 | The system shall enforce reviewed phone-verification controls without generating, persisting or logging OTP values in AAYUVYA; transient entered code is passed through NestJS to Twilio Verify. | SRC-013; U/B; conflict CLR-024 | US-001–US-002; FR-005; CLR-004 |
| SEC-006 | The system shall protect password reset against expired/reused authorization and unnecessary account enumeration. | SRC-002; C/Q | US-004; FR-012; BR-005; CLR-004–CLR-005 |
| SEC-007 | The system shall protect authentication and sensitive account-access operations against brute-force and excessive repeated requests using approved limits. | SRC-002, SRC-006; C/Q | US-002–US-004; FR-003–FR-012; CLR-004 |
| SEC-008 | The system shall reject unverified external identity evidence and prevent association based solely on unverified contact matches. | SRC-002; C | US-002–US-003; FR-006–FR-009; CLR-005 |
| SEC-009 | The system shall enforce backend expiry/revocation and current-session logout; rotating session-bound refresh is the selected continuity baseline and never replaces current authorization. | SRC-002, SRC-013; C/U/B; values/effects P/Q | US-004, US-017; FR-010–FR-011, FR-053–FR-054; CLR-004 |
| SEC-010 | The system shall prevent passwords, OTPs, authentication secrets and payment credentials from appearing in logs or unauthorized outputs, and avoid sensitive personal information in authentication evidence. | SRC-002, SRC-006; C | US-002–US-004, US-013, US-017; FR-003–FR-012, FR-033–FR-034, FR-042 |
| SEC-011 | The system shall protect production communications and avoid exposing internal exception details in user-visible failures. | SRC-005–SRC-006; C | All stories; FR-044 |
| SEC-012 | The system shall apply access and security safeguards consistently to protected actions, including production-equivalent use, without convenience-based bypasses. | SRC-002–SRC-003, SRC-006; C | US-017 and all protected stories; FR-042 |

SRC-013 establishes the India operating context, data-minimization boundaries and provisional retention periods. Notices, applicable legal requirements, consent, category overlap, deletion and final retention approval remain CLR-021; no legal compliance certification is claimed.

### 4.8 Non-functional requirements

| ID | Quality outcome and measurement | Target / status | Traceability |
| --- | --- | --- | --- |
| NFR-001 | Usability: each approved journey distinguishes loading, success, empty results, failure, denied access and network failure when applicable. Measure scenario outcomes and whether users can identify the current state. | State handling is C (SRC-005). Completion-rate, user-study and wording targets are NEEDS CLARIFICATION, CLR-022. | All stories; FR-044; EC-039, EC-043; SC-011 |
| NFR-002 | Performance: users can access approved histories and result collections in manageable portions without incorrect omissions or misleading state. Measure response time and completeness under agreed data volumes, devices and connectivity. | Large-result handling is C (SRC-007). SRC-013 proposes ordinary API p95 <500 ms excluding provider time and common interactions normally <2 s; approval, data volumes, load and measurement conditions remain Q, CLR-022. | US-006, US-008, US-011, US-014–US-016; FR-016, FR-021, FR-027, FR-036, FR-038, FR-041; SC-012 |
| NFR-003 | Data integrity: defined related operations retain their approved all-or-nothing business outcome, and data constraints continue to hold during competing changes. Measure business records against policy-derived expectations. | C (SRC-007); no violations of an approved invariant in its acceptance cases. Which operations are inseparable remains Q under capability policies. No production error-rate commitment is invented. | US-006–US-014, US-016; FR-029, FR-045–FR-046; SC-005–SC-008, SC-011 |
| NFR-004 | Reliability/recovery: interrupted operations and external failures do not silently produce false success or conceal failure. Measure resumed journeys, known outcomes and duplicate effects. | Failure visibility is C (SRC-005); resumption behavior is D. SRC-013 proposes monthly availability 99.5%; budget/definition/approval, RTO/RPO and support targets remain Q, CLR-022. | All stories; FR-044–FR-046; EC-039–EC-042; SC-011–SC-012 |
| NFR-005 | Security/privacy: verify that unauthorized reads/changes are denied and sensitive information is absent from prohibited outputs. | C (SRC-002–SRC-003, SRC-006); no unauthorized access or prohibited secret disclosure in the specified validation cases. Privacy scope is Q, CLR-021. | US-017 and all protected stories; SEC-001–SEC-012; SC-010 |
| NFR-006 | Compatibility: the initial release shall support both Android and iOS smartphones; neither may be excluded without explicit approval. Evaluate selected journeys across representative screen sizes, resolutions, OS versions and device capabilities on both platforms. Minimum supported OS versions must be agreed before release acceptance. Assess Expo-compatible workflow feasibility without weakening required behavior. | SRC-011; U for both platforms, evaluation dimensions and the OS-version acceptance gate. SRC-009–SRC-010 retain C constraints. Exact minimum versions, representative configurations and integration feasibility remain Q, CLR-020. | All selected stories; shared scenarios in Section 2.1; EC-046; SC-012 |
| NFR-007 | Responsive/accessibility: support screen sizes, system text scaling, keyboard/platform navigation, meaningful screen-reader labels, logical focus, contrast, accessible touch targets and understandable error recovery on Android/iOS. English is initial language. | SRC-013; U/B for outcomes; exact standards/thresholds/test matrix Q, CLR-020 | Selected stories; Section 2.1; EC-045; SC-012 |
| NFR-008 | Validation reliability: important success, failure, exception, validation and authorization behaviors are verifiable repeatedly against controlled conditions. | C (SRC-008); repeated identical conditions produce the policy-defined expected outcome. Coverage threshold beyond constitutional obligations is NEEDS CLARIFICATION, CLR-022. | All stories; all acceptance scenarios; SC-013 |

### 4.9 Integration requirements

Twilio Verify is selected, subject to CLR-024 and configuration. Google/Apple are supported identity methods. Email vendor, payment provider and general push channel remain undecided. No live Zoho integration is permitted; export continuity is separate under CLR-023.

| ID | Business-level exchange and expected outcome | Failure outcome | Source / status; coverage |
| --- | --- | --- | --- |
| INT-001 | If Google sign-in is enabled, identity evidence must establish the verified Google identity associated with the correct internal user. | Unavailable or invalid verification does not establish authenticated access; show a safe access failure. | SRC-002; C/Q; US-002–US-003; FR-006–FR-009; CLR-003 |
| INT-002 | If Apple sign-in is enabled, identity evidence must establish the verified Apple identity, including private relay handling without accidental duplication. | Missing or invalid verification does not establish authenticated access or an unverified identity association. | SRC-002; C/Q; US-002–US-003; FR-006–FR-009; CLR-003 |
| INT-003 | Twilio Verify generates/checks SMS codes; NestJS controls member/purpose binding and accepts authenticated verification results. Retain necessary status metadata, never OTP values. | Delivery/client claims cannot authenticate; provider failure or incomplete local completion must not produce false success. | SRC-013; U/B; US-001–US-002; FR-005, FR-047; CLR-004, CLR-024 |
| INT-004 | If external notification channels are selected, exchange the approved destination and permitted event content and use available evidence to distinguish attempt from delivery. | Failure, denied permission or missing delivery evidence does not justify a delivered claim or unauthorized fallback. | SRC-001, SRC-005–SRC-006; D/Q; US-012; FR-030–FR-032; CLR-013 |
| INT-005 | If payment processing uses an external service, associate verified financial outcomes with the correct logical payment, purchase and beneficiary. | Unknown, delayed, conflicting or repeated outcomes must not cause false final status or duplicate recorded business effects. | SRC-001, SRC-005, SRC-007; D/Q; US-013–US-014; FR-033–FR-037; CLR-014–CLR-015 |
| INT-006 | Deliver reset authorization to verified email through the selected channel, with 5-minute, single-use and supersession rules. | Failure neither reveals account existence nor changes passwords; vendor/configuration remains open. | SRC-013; U/B; US-004; FR-012; CLR-004–CLR-005 |

### 4.10 Clarification register

**Blocking** means the affected scope, policy or acceptance behavior cannot be finalized before its implementation is authorized; it does not prevent documenting the draft. A decision for a capability can be deferred only after CLR-001 explicitly excludes that capability from the release. Recommendations remain advisory and unapproved. Confirmed decisions are explicitly distinguished from recommendations: SRC-013 resolves portions of CLR-001–CLR-008 and CLR-020–CLR-023. SRC-013 identifies approval responsibilities; names and actual approvals remain open. CLR-024 records the OTP conflict.

#### CLR-001 — Release, approval authority and priorities

- **Status/source:** partially resolved for authentication planning by SRC-013; no final client-approved full-product Phase 1 matrix.
- **Scope:** US-002, US-003, US-004 and US-017, only US-001 identity prerequisites and US-016 access boundary. Implement one story at a time and validate before moving on. Do not build unrelated business modules for authentication.
- **Proposed product Phase 1:** authentication/recovery, required verification, minimum approved profile, backend session/role/ownership enforcement, and other core journeys only where separately client-approved.
- **Deferrals:** family/couple delegation, advanced wellness/passport/progress/reporting and unrelated features remain outside authentication implementation.
- **Authority:** client-designated product owner approves business scope/priorities/acceptance; technical lead reviews consistency; security/privacy owner reviews sensitive policies. Names and actual signoffs remain NEEDS CLARIFICATION.
- **Priorities:** P0 security/integrity, P1 core and P2 deferred is still a proposal; do not silently replace the specification's existing priority scheme.
- **Remaining question / affected:** obtain the approved capability matrix and actual service/commercial/privacy/operational documents. Affects all product stories/requirements; blocks full-product readiness, not this planning update.
- **Recommendation:** approve a bounded matrix rather than restoring SRC-012's broad Phase 1 by implication.

#### CLR-002 — Registration and profile information

- **Status/source:** registration baseline supplied by SRC-013; final profile/age requirements remain open.
- **Decision:** self-service member registration requires primary authentication, verified phone, stable internal ID, system-maintained status/creation time and approved minimum profile. Email/password registration additionally verifies email; social authentication alone does not complete registration.
- **Pending access:** only registration, verification and permitted recovery until required verification is complete.
- **Validation:** E.164 phone normalization and consistent email validation/normalization; changed contacts must be verified. No member edits to internal IDs, roles, verification flags or other security fields.
- **Remaining questions:** exact display/profile fields and bounds, ages/service-specific needs, precise email normalization, email verification expiry/resend/supersession, secure contact replacement and phone-country eligibility. India-only operating scope does not by itself mean only +91 numbers are accepted. No mandatory demographics without approved purpose.
- **Affected/gate:** US-001–US-003, US-017; FR-001–FR-002, FR-043, FR-047–FR-052; final onboarding acceptance needs field/country decisions and CLR-024 reconciliation.
- **Recommendation:** agree a minimal field/verification matrix without removing the confirmed phone/email gates.

#### CLR-003 — Authentication-method enablement

- **Status/source:** all four member methods selected by SRC-013; production configuration and privileged-role method policy remain open.
- **Matrix:** email/password, phone OTP and Google on Android/iOS; native Apple sign-in on iOS with approved non-Apple alternatives on Android. The earlier “only Google on Android” ambiguity is superseded. Do not silently remove a supported product method.
- **Registration:** any enabled method may begin member onboarding, but every new member verifies phone; email/password also verifies email. Public routes create MEMBER only; OPERATOR/ADMIN are controlled.
- **Activation:** fail closed if provider configuration or evidence is invalid. Backend verifies provider signature/issuer/audience/expiry and stable subject; client email/role is not proof.
- **Workflow:** Expo Go is required initially for compatible work; EAS development builds on the physical iPhone validate Google OAuth and other app-specific/native flows. Windows/no Mac is known context.
- **Remaining questions / affected:** trusted client IDs, redirects, provider accounts, initial implementation method and operator/admin method access; US-001–US-004, US-017; FR-003–FR-009, FR-047–FR-052; INT-001–INT-003; CLR-020, CLR-024.
- **Recommendation:** validate actual method/platform configurations; a configuration gap does not authorize dropping either platform.

#### CLR-004 — Credential, OTP and session policies

- **Status/source:** mixed confirmed rules, selected planning behavior and provisional values under SRC-013; security review remains required.
- **Password/reset:** minimum 8 characters; reject current-password reuse; no invented composition/history rules. Use a maintained strong password hash. Verified-email reset authorization lasts 5 minutes, is single-use, and a new request invalidates previous authorizations. Avoid enumeration.
- **Twilio:** Verify generates/checks codes; AAYUVYA does not generate/persist/log OTP values. User-entered code passes transiently through NestJS, which controls member/purpose binding and access. Constitutional conflict: CLR-024.
- **Provisional OTP limits:** 5 failed checks per verification, 60-second resend/request cooldown, 5 requests per phone per rolling hour. The source calls these both proposals and initial limits; conservatively require review. Provider expiry, resend behavior and provider-side settings remain unconfirmed.
- **Selected sessions:** backend-tracked sessions, continuity across ordinary restarts, rotating session-bound refresh, current-session logout and security-event revocation.
- **Provisional settings:** RS256, 15-minute access JWT, 30-day inactivity, maximum 5 active devices/sessions. Define qualifying activity, device/session meaning and cap behavior; no oldest-session eviction is assumed.
- **Planned/review-dependent:** logout-all-devices requires UX/policy; refresh reuse revokes the associated session/family and requires sign-in, but family scope and legitimate concurrency/lost-response handling need review. All-session revocation after reset is proposed. Do not invent account suspension criteria.
- **Still open:** hash algorithm/parameters, password maximum/count semantics, issuer/audience, key storage/rotation, clock tolerance, refresh lifetime, security-event scope, shared rate dimensions and revocation races.
- **Affected/gate:** US-001–US-004, US-017; FR-004–FR-005, FR-010–FR-012, FR-047–FR-050, FR-053–FR-054; SEC-004–SEC-009. Blocks affected production acceptance, plus CLR-024.
- **Recommendation:** review a concrete parameter catalog; keep provisional values distinct from fixed user rules.

#### CLR-005 — Identity collision, association and recovery

- **Status/source:** canonical identity and linking baseline selected in SRC-013.
- **Decision:** one canonical internal identity; contact/provider identifiers are attributes. No merge based on names or unverified values. Linking requires reauthentication to the existing account plus proof of control of the added method.
- **Phone uniqueness:** one verified phone authenticates one member unless a shared-number exception is explicitly approved; family relationships imply no shared credentials.
- **Conflicts/recovery:** stop association already owned elsewhere without disclosure. No self-service merging. Lost Google/Apple access uses another verified method or an approved assisted process; never bypass verification.
- **Assisted resolution:** authorized staff, identity checks and an audit record are required; workflow, evidence, audit access/retention and recycled-phone/contact-replacement handling remain NEEDS CLARIFICATION.
- **Affected/gate:** US-001–US-004, US-017; FR-007–FR-009, FR-012, FR-051. Undefined support/recovery paths remain blocked.
- **Recommendation:** define evidence and authority while preserving identity and historical record ownership.

#### CLR-006 — Family and couple relationships

- **Status/source:** deferred by SRC-013 until lifecycle and permissions are approved.
- **Decision:** initial authentication treats members independently. No shared credentials, automatic foreign-profile access, delegated booking, shared credits or membership benefits by implication.
- **Later decisions:** creation/acceptance/removal, group sizes, minors/guardian consent, visibility, booking/payment/credit rights and effects on existing records.
- **Affected/gate:** US-005 and later delegated journeys; FR-013–FR-014, SEC-002. No delegation in authentication delivery; questions block only a later approved relationship feature.
- **Recommendation:** retain the product story without implementing it in this slice.

#### CLR-007 — Membership plans and eligibility

- **Status/source:** SRC-013 distinguishes membership entitlement from account existence; commercial rules remain client decisions.
- **Decision:** display approved plan information only; no automatic benefits from accounts/family ties and no assumed auto-renewal.
- **Client input required:** prices, duration, benefits, eligibility/decision time, renewal/cancellation/suspension/grace/refund and effects on appointments/credits.
- **Operational baseline for review:** separate payment outcome and membership activation where needed; preserve state-change audit evidence with agreed workflow/access/retention.
- **Affected/gate:** US-006–US-008, US-010–US-014; FR-015–FR-017 and linked rules. Commercial implementation is outside authentication and remains blocked by policy gaps.
- **Recommendation:** obtain real catalog and example outcomes; do not choose commercial defaults.

#### CLR-008 — Appointment subject, discovery and booking

- **Status/source:** SRC-013 supplies a booking baseline; operational approval/details remain open.
- **Baseline:** scheduled approved service for a member with authorized operator/resource. Member discovery/booking is proposed, with staff assistance only where approved.
- **Required input:** catalog, duration, timezone, hours, capacity/exclusivity, horizon/lead time, cancellation/rescheduling cutoffs, payment/credit timing and no-show policy.
- **Proposed integrity:** revalidate availability at submission, avoid conflicting exclusive-resource confirmations and make repeated logical submissions nonduplicating.
- **Excluded until approved:** family-member, group/recurring booking and waitlists.
- **Affected/gate:** US-007–US-008; FR-018–FR-022, FR-045–FR-046; CLR-018 for resource specifics. Outside authentication delivery.
- **Recommendation:** approve operational policies before final booking acceptance.

#### CLR-009 — Appointment changes and missed attendance

- **Question:** Are cancellation and rescheduling supported, by whom and until when; how are no-shows handled; and what happens to payment, credits, membership and reminders after a change?
- **Why / impact:** these policies are not established by the word “appointments.” **Affected:** US-008–US-009, US-011–US-014; FR-022, FR-024, FR-028, FR-032, FR-037, FR-046; SC-004–SC-005, SC-007–SC-008.
- **Consequence if unresolved:** changes, penalties and linked effects cannot be promised. **Classification:** blocking for change/no-show behavior; deferrable only if explicitly excluded from release.
- **Options:** no member changes, staff-managed changes or policy-governed member changes; no option is approved.
- **Recommendation:** approve deadlines and linked effects explicitly; do not infer credit refunds or financial refunds.

#### CLR-010 — Wellness-session meaning and lifecycle

- **Question:** What does “therapy session” mean in this wellness business; who facilitates and records it; what outcomes and corrections are allowed; and how does it relate to appointments, programs and credits?
- **Why / impact:** “therapy” does not establish clinical services or professional roles. **Affected:** US-009, US-011, US-015–US-016; FR-023–FR-024, FR-028, FR-038–FR-040, FR-046; SC-005, SC-009.
- **Consequence if unresolved:** service-delivery acceptance and downstream effects remain unknown. **Classification:** blocking for sessions.
- **Options:** retain the source term with a defined nonclinical operational meaning, or approve a more precise wellness term. Clinical scope is not an available implied default.
- **Recommendation:** confirm the operational definition and participant/outcome responsibilities before recording session details.
- **Current source:** SRC-013 selects OPERATOR, not a clinical practitioner; detailed operational role/session permissions remain open.

#### CLR-011 — Programs and enrollment

- **Question:** What constitutes a program, who can enroll a member, what eligibility/capacity/duplicate rules apply, and what participation, withdrawal or completion states and session relationships exist?
- **Why / impact:** a named program does not define enrollment policy. **Affected:** US-010–US-011; FR-025–FR-029, FR-045–FR-046; SC-006.
- **Consequence if unresolved:** enrollment and participation acceptance remain incomplete. **Classification:** blocking for programs.
- **Options:** approve the actual program catalog and per-program or shared rules; no program duration or session count is evidenced.
- **Recommendation:** specify enrollment authority and the meaning of successful enrollment before related credit or payment effects.

#### CLR-012 — Credit source, units and lifecycle

- **Question:** Are credits purchased, included with membership, assigned administratively or granted otherwise; who owns them; what units and eligibility apply; when are they allocated/consumed; and do expiry, rollover, reservation, reversal, adjustments or sharing exist?
- **Why / impact:** the constitution names credits without defining their economics or lifecycle. **Affected:** US-005–US-011, US-013, US-016; FR-017, FR-022, FR-024, FR-027–FR-029, FR-035, FR-040, FR-045–FR-046; SC-002, SC-005.
- **Consequence if unresolved:** balances and deduction outcomes have no approved expected value. **Classification:** blocking for all credit-dependent journeys.
- **Options:** the named acquisition categories are discovery options only; multiple categories need explicit interaction rules.
- **Recommendation:** approve a credit policy with examples of grants, consumption, boundaries, interrupted sessions and corrections; do not choose a default deduction event.
- **Supporting scope proposal:** SRC-012 includes credit transactions in proposed Phase 1. Confirm whether this means a member-visible history and define its content, access and correction semantics before extending US-011; ENT-014 currently explains credit events conceptually and does not promise a visible ledger.

#### CLR-013 — Notification and reminder policy

- **Question:** Which events, channels, recipients, contents, consent/permission conditions, timing, duplicate limits, lateness rules and delivery/fallback outcomes are required?
- **Why / impact:** notification capability does not approve push, SMS or email for every event. **Affected:** US-008, US-012; FR-030–FR-032; INT-004; EC-035–EC-038; SC-008.
- **Consequence if unresolved:** coverage and delivery success cannot be measured. **Classification:** blocking for notifications; delivery-rate targets may follow channel selection.
- **Options:** approve channels and recipient policies per event; no channel default is evidenced.
- **Recommendation:** distinguish event recording, attempt and verified delivery and approve reminder behavior after changes.

#### CLR-014 — Payment purpose, confirmation and fulfillment

- **Question:** Which items can be paid for, by whom and for whose benefit; what amounts/currencies and processing route apply; what establishes authoritative payment status; what is one logical payment; and when does purchase fulfillment occur?
- **Why / impact:** payment and membership/session entitlement must not be silently conflated. **Affected:** US-006, US-010–US-011, US-013–US-014; FR-033–FR-036, FR-045–FR-046; INT-005; SC-007.
- **Consequence if unresolved:** payment and purchase outcomes cannot be specified accurately. **Classification:** blocking for payments.
- **Options:** approve the actual payable-item catalog and commercial flows; no provider, currency or prepayment requirement is evidenced.
- **Recommendation:** define payment evidence precedence and an explicit paid-but-unfulfilled business outcome and responsible role.

#### CLR-015 — Billing, invoices, tax, refunds and reconciliation

- **Question:** What billing records are visible to which parties; are receipts/invoices required; which tax/jurisdiction rules apply; are refunds/reversals supported; who resolves disputes or discrepancies and within what policy?
- **Why / impact:** “billing” does not establish fiscal documents or refund entitlements. **Affected:** US-013–US-014, US-016; FR-034–FR-037, FR-040–FR-041, FR-046; INT-005; SC-007.
- **Consequence if unresolved:** financial documentation and correction acceptance remain incomplete. **Classification:** blocking for required billing obligations; optional document/correction capabilities can be deferred only explicitly.
- **Options:** determine mandatory business documents and approve any correction/refund workflow; no legal or tax defaults are inferred.
- **Recommendation:** obtain decisions from the finance/business authority and keep unresolved fulfillment distinct from a refund decision.

#### CLR-016 — Digital wellness passport

- **Question:** What member outcome does the passport serve; what content and sources does it include; who can view/correct it; and is any sharing or export intended?
- **Why / impact:** the name alone does not specify meaningful content. **Affected:** US-015; FR-038–FR-039; SEC-002; SC-009.
- **Consequence if unresolved:** core passport functionality cannot be considered fully specified. **Classification:** blocking for passport scope.
- **Options:** approve a bounded set of existing wellness information or provide additional approved requirements. No clinical information, measurements or sharing capability is presumed.
- **Recommendation:** define purpose and minimum content before expanding data collection or access.
- **Current source:** SRC-013 defers advanced passport/progress capabilities from authentication implementation; their product content still requires approval.

#### CLR-017 — Administrative authority and operational responsibility

- **Status/source:** MEMBER, OPERATOR and ADMIN selected in SRC-013; real action matrix awaits product-owner approval.
- **Provisioning:** public registration creates MEMBER only. OPERATOR/ADMIN require trusted authorized provisioning with audit evidence; no public admin route, client/provider role grant or SUPER_ADMIN without approval.
- **Enforcement:** backend identity/roles and persisted ownership; deny unknown permission, including list results. Test-only fixtures do not establish production grants.
- **Remaining questions:** action-by-role-by-subject matrix, initial administrator authority, role changes/revocation, support powers and audit fields/access/retention.
- **Affected/gate:** US-001, US-016–US-017; FR-040–FR-042, FR-052. Undefined privileged actions/provisioning are blocked.
- **Recommendation:** approve least-privilege grants and a controlled bootstrap process. Operator does not imply clinical practitioner.

#### CLR-018 — Operators, equipment and calendars

- **Question:** Are operator accounts, operator/equipment allocation, maintenance/unavailability, operating calendars and conflict prevention included, and in which release? What resources and constraints determine capacity?
- **Why / impact:** these appear only in the task's discovery checklist. **Affected:** candidate capabilities; US-007–US-009 if adopted; FR-019–FR-020, FR-023; EC-020; SC-004.
- **Consequence if unresolved:** no resource-management scope or reliable resource-based availability requirement can be claimed. **Classification:** blocking scope decision if resource availability is needed for launch; otherwise explicitly defer the decision with the capability.
- **Options:** explicitly include and specify these operations, or explicitly defer/exclude them for the selected release.
- **Recommendation:** confirm operational dependencies before approving booking capacity; introduce no clinical professional roles by analogy.

#### CLR-019 — Dashboard and reporting

- **Question:** Is a member dashboard or operational reporting required, for which audience and decisions, using which measures and access rights?
- **Why / impact:** neither presentation nor analytics scope is documented. **Affected:** candidate capabilities; US-006, US-008, US-011, US-014–US-016 only as potential information sources; FR-016, FR-021, FR-027, FR-036, FR-038, FR-041.
- **Consequence if unresolved:** no dashboard/report commitment or success metric can be made. **Classification:** deferrable scope decision unless selected as essential by CLR-001.
- **Options:** explicitly include and define outcome-based stories, or explicitly defer/exclude. A required information view does not automatically require a dashboard.
- **Recommendation:** approve the user decision and measures before adding a reporting capability.

#### CLR-020 — Platform compatibility and accessibility

- **Status/source:** SRC-013 confirms Android/iOS smartphones, English and Windows plus physical iPhone/no Mac; acceptance matrix remains open.
- **Support:** neither platform may be excluded without approval; minimum OS versions and representative screens/resolutions/capabilities must be agreed before acceptance.
- **Accessibility:** responsive layouts, keyboard/navigation, text scaling, meaningful screen-reader labels, logical focus, contrast, touch targets and understandable error recovery. Standard/thresholds/configurations remain NEEDS CLARIFICATION.
- **Workflow:** Expo Go is mandatory initially for supported Expo/JavaScript work; do not assume arbitrary native modules are included. EAS cloud development builds on iPhone validate Google OAuth and required app-specific/native flows.
- **Evidence:** iPhone-only testing does not prove Android support; use an Android emulator on Windows or obtain Android device testing. Provider/signing/developer-account setup is still needed.
- **Affected/gate:** all selected stories, NFR-006–NFR-007, SC-012, EC-045–EC-046. Exact OS/device/accessibility matrix blocks final acceptance.
- **Recommendation:** preserve both platforms and record real build/device evidence; no Mac purchase or release is authorized by this documentation task.

#### CLR-021 — Privacy, consent and data handling

- **Status/source:** India operating scope and privacy principles from SRC-013; legal/privacy approval remains outstanding.
- **Decision:** data minimization, purpose limitation, least privilege, confidentiality and clear notices. Essential service messages differ from optional marketing consent. No minors, family sharing or optional sensitive collection without approved policies.
- **Provisional retention:** diagnostic logs 30 days; security/audit logs 180 days; privileged-action audit records 2 years. Not approved schedules or legal-sufficiency claims; overlapping categories and legal holds need resolution.
- **Remaining questions:** actual operating entity/data flows and applicable Indian obligations confirmed by responsible advisers; notice/consent/withdrawal, deletion, financial/legal retention, audit access and assisted-recovery records.
- **Affected/gate:** all personal-data stories; SEC-002, SEC-010–SEC-012; blocks unapproved production collection, retention/deletion and sharing.
- **Recommendation:** approve the data inventory/policies; this document makes no legal compliance determination.

#### CLR-022 — Quality targets, recovery and measurement

- **Status/source:** SRC-013 provides provisional targets, not approved SLA commitments.
- **Proposed:** ordinary API p95 under 500 ms at agreed load excluding providers; common interaction normally under 2 seconds under defined conditions; monthly availability 99.5% subject to operating budget.
- **Expected:** repeatable per-story success/failure/denial/recovery tests, no misleading provider success or duplicate critical effects; validate one story before moving on.
- **Open:** load/concurrency and measurement boundaries, interaction percentile/device/network conditions, availability definition, RTO/RPO, support hours/owner/escalation, delivery targets and observation periods. Business conversion/retention needs a baseline.
- **Affected/gate:** all selected stories; NFR-001–NFR-008, SC-001–SC-013. Values support test design, not production acceptance without approval.
- **Recommendation:** agree conditions and operations responsibility separately from functional tests; no SLA claims from local tests.

#### CLR-023 — Existing data and fresh-implementation boundary

- **Status/source:** SRC-013 DEC-018 supplies continuity direction; no omitted separate CLR-023 text is inferred.
- **Decision:** no live Zoho integration. Fresh code does not prove empty business data; client must decide continuity before production.
- **If needed:** approved export with data owner, authoritative fields/mapping, conflicts and reconciliation; member/contact, benefit, credit, appointment, finance, program, consent and passport records only where approved.
- **Safeguards:** no phone verification inferred from spreadsheets. Credentials need reviewed secure migration; re-verification/reset may be necessary.
- **Affected/gate:** all data-bearing stories; authentication US-001–US-004, FR-007, FR-047–FR-051. No import scope or empty-production default approved.
- **Recommendation:** obtain an export-scope or explicit no-history decision; do not build a connector or erase identity records.

#### CLR-024 — Twilio Verify and constitutional OTP wording

- **Status:** unresolved cross-document conflict. SRC-013 selects Twilio-managed code generation/checking; constitution.md says “OTP generation and verification must occur on the backend.”
- **Proposed reconciliation:** explicitly permit approved provider delegation through NestJS, retaining backend authority for member/purpose binding, abuse controls, sessions and authorization. Delivery receipts and client claims remain insufficient.
- **Affected/gate:** US-001–US-002; FR-005, FR-047; SEC-005; INT-003; plan DEC-006. Resolve before implementing conflicting delegated OTP behavior; no local-code-generation fallback.
- **Decision needed:** document the interpretation/amendment through constitutional governance. No amendment has been approved or applied by this task.
- **Recommendation:** use narrow delegation wording; no surrender of backend application identity/session authority is needed.

## 5. Business Entities

These are conceptual business concepts, not persistence or interface designs. “Attributes” describe information needed to discuss behavior; they are **proposed** until the referenced policy/field decisions are approved. A concept need not be stored separately. Lifecycle names are not approved merely because a capability exists. All entities inherit the unresolved release assignment in CLR-001.

| ID / entity | Business purpose and important information | Relationships and applicable rules | Lifecycle / status | Stories, requirements and evidence |
| --- | --- | --- | --- | --- |
| ENT-001 — Member | The person whose wellness participation or entitlement is managed. Person identity and approved profile information; exact fields CLR-002. | Related to account, relationships, membership, appointments, sessions, enrollment and passport. BR-001, BR-007–BR-008. A dependent's ability to sign in is CLR-006. | Pending versus completed registration is established; restriction/departure and demographic rules remain CLR-002, CLR-005. | SRC-001; US-001, US-005–US-015; FR-001–FR-002, FR-013–FR-039 |
| ENT-002 — Account / internal user identity | Canonical internal identity with pending-verification versus completed-registration distinction; no phone/provider identifier replaces it | Methods, verified contacts and backend-granted permissions; BR-001–BR-003, BR-009, BR-011 | Pending access is limited until required verification; suspension/deletion details still need policy | SRC-002, SRC-013; US-001–US-004, US-017; FR-007, FR-047–FR-053 |
| ENT-003 — Authentication method association | The verified relationship between an enabled sign-in method and an internal identity. Method, verified identity evidence/association; exact contact rules unresolved. | Belongs to the internal identity; BR-001–BR-003. Matching contact information alone is not the association. | Verification precedes association; unassociation, replacement and collision resolution CLR-005. | SRC-002; US-002–US-003; FR-003–FR-009 |
| ENT-004 — Authentication session | Backend-tracked access context with rotating refresh supporting ordinary restart continuity. | Bound to internal identity; authorization/completion evaluated separately. BR-006–BR-007, BR-009. | Current logout revokes current session; refresh rotation selected; inactivity/session cap, replay-family and security-event details need review. CLR-004. | SRC-002–SRC-003, SRC-013; US-002, US-004, US-017; FR-010–FR-011, FR-042, FR-053–FR-054; SEC-009 |
| ENT-005 — Member profile | Approved descriptive/contact information for a member. Required, optional and editable fields remain CLR-002; not a clinical record. | Describes a member; delegated visibility is separate from family/couple association. BR-007–BR-008. | Accepted updates change permitted information; verification, history and deletion policies CLR-002, CLR-005, CLR-021. | SRC-001, SRC-003–SRC-004; US-001, US-005, US-017; FR-002, FR-014, FR-042–FR-043 |
| ENT-006 — Family or couple relationship | The approved association among participants. Relationship type, participants and management authority; cardinality and benefit sharing unresolved. | Links member/account concepts without replacing individual identity. BR-001, BR-007; CLR-006. | Creation, acceptance, change and termination need policy; none is presumed. | SRC-001; US-005; FR-013–FR-014 |
| ENT-007 — Membership plan | A defined membership offering and its approved terms. Plan name, benefits and any approved duration/price; actual catalog not supplied. | Memberships refer to applicable terms; program/credit/payment links require CLR-007, CLR-012, CLR-014. BR-008 for defined constraints. | Availability, revision and retirement rules unspecified; old-term treatment requires CLR-007. | SRC-001; US-006, US-016 if plan administration approved; FR-015–FR-017, FR-040 |
| ENT-008 — Membership | The member's approved membership relationship and entitlement under a plan. Holder/beneficiary, applicable terms, state and relevant dates only as policy defines. | Relates member and plan; group ownership and payment linkage unresolved. BR-007–BR-008; CLR-006–CLR-007. | Acquisition, activation, renewal, expiry, suspension and changes are questions, not an approved list of states. | SRC-001; US-006; FR-016–FR-017 |
| ENT-009 — Appointment | An agreed or requested wellness arrangement under the approved booking policy. Participant, appointment subject, time and approved outcome/state. | Relates to a member; links to sessions, membership, credits, payment or resources only if approved. BR-007–BR-008; CLR-007–CLR-010, CLR-018. | Request/acceptance semantics and all subsequent statuses, cancellation and rescheduling transitions require CLR-008–CLR-009. | SRC-001; US-007–US-008; FR-018–FR-022 |
| ENT-010 — Wellness session | The actual instance of wellness participation/service delivery, corresponding to the constitution's session capability. Member, defined activity and permitted outcome information. | Possible appointment, program and credit-event relationships remain CLR-010–CLR-012. BR-007–BR-008. No clinical notes or practitioner role inferred. | Permitted delivery, completion, interruption and correction outcomes require CLR-010. | SRC-001; US-009; FR-023–FR-024 |
| ENT-011 — Wellness program | A defined wellness participation offering. Purpose, approved conditions and composition; no duration or session count assumed. | Members participate through enrollment; relationships to sessions, memberships and credits need CLR-011. BR-008. | Availability and program lifecycle unspecified. | SRC-001; US-010; FR-025–FR-026 |
| ENT-012 — Program enrollment | The association establishing a member's participation in a program. Participant, program and approved enrollment outcome. | Connects member and program; BR-007–BR-008; CLR-011. | Enrollment acceptance, withdrawal and completion semantics require policy; not assumed transitions. | SRC-001; US-010; FR-025–FR-026 |
| ENT-013 — Session-credit entitlement / balance | The member's or approved group's usable session entitlement. Owner, unit, eligible uses and policy-derived quantity; source and expiry unknown. | May relate to memberships, programs, purchases or administrative grants only if approved. BR-007–BR-008; CLR-006, CLR-012. | Changes only through approved credit events; zero, negative, expired and reserved positions require defined semantics. | SRC-001; US-011; FR-027–FR-029 |
| ENT-014 — Credit event | A conceptual explanation of a policy-defined change in credit position. Event meaning, quantity, affected entitlement and originating business event. This does not mandate a member-visible transaction ledger. | Explains credit balance; possible session, appointment, membership or purchase cause. BR-008; CLR-012. | Permitted grant, consumption, reservation, release and adjustment categories are unresolved; no category is preapproved. | SRC-001, SRC-007; D concept; US-011; FR-027–FR-029, FR-045–FR-046 |
| ENT-015 — Payment | The financial outcome associated with an approved payable item. Payer, beneficiary, item, amount, currency and verified outcome; actual policies CLR-014. | Relates to transaction/billing information and fulfillment; membership, program or credit purchase not presumed. BR-007–BR-008. | Must distinguish verified outcomes from uncertainty; exact pending, failed, settled, reversed and refunded states require CLR-014–CLR-015. | SRC-001; US-013; FR-033–FR-035 |
| ENT-016 — Billing / transaction information | The business view of recorded financial activity. Permitted item/amount/currency/outcome information; receipt/invoice/tax fields require separate confirmation. | Relates to payment and authorized payer/beneficiary viewers. BR-007–BR-008; CLR-015. | Recording and any correction/reversal lifecycle require policy; no refund entitlement inferred. | SRC-001; US-014; FR-036–FR-037 |
| ENT-017 — Notification / reminder | An event-related communication to an approved recipient. Event, recipient, permitted content, channel, intended timing and available delivery evidence. | Relates to an approved account/appointment/financial or other event only after CLR-013. BR-007. | Event recorded, attempt made and delivery evidenced are distinct concepts, not a prescribed complete status list; cancellation/suppression/lateness policy unresolved. | SRC-001, SRC-005; US-012; FR-030–FR-032 |
| ENT-018 — Digital wellness passport | The member's defined passport information view. Purpose, approved contents and source relationships need CLR-016. | Relates to the member and approved contributing information only. BR-007; privacy CLR-021. | Creation, updates, correction and visibility depend on the approved content/source policy; no clinical lifecycle inferred. | SRC-001; US-015; FR-038–FR-039 |
| ENT-019 — Administrative role / authorized administrative user | MEMBER, OPERATOR and ADMIN are initial role labels; privileged assignments controlled and auditable | Internal identity plus explicit approved action/subject grants; no SUPER_ADMIN or client-granted roles | Provisioning/change/revocation authority and production grants remain CLR-017 | SRC-013; US-001, US-016–US-017; FR-040–FR-042, FR-052; SEC-003 |

**Intentionally not modeled as approved entities:** operator, equipment, facility/location, calendar resource, service catalog item, clinical record, invoice, report and dashboard. Their status or necessary detail is unresolved under CLR-008, CLR-010, CLR-015, CLR-018–CLR-019. An appointment's subject does not by itself approve a service-catalog management capability. If a decision adds one of these concepts, its lifecycle, stories and acceptance criteria must be specified before claiming completeness.

## 6. Success Criteria

These measure business-visible outcomes, not completion of technical tasks. No approved adoption/revenue/SLA baseline or observation period is supplied. SRC-013 provides provisional latency/availability targets under CLR-022, not approved commitments.

Where a target says **proposed**, it is a suggested acceptance standard requiring approval under CLR-001 and CLR-022. A constitutional invariant such as denying unauthorized access is already mandatory, but proving it in controlled cases is not a claim of measured production performance. Policy-dependent tests cannot be declared passed using arbitrary sample policies as substitutes for approval. Each criterion applies only to the approved release's applicable stories.

| ID | Desired outcome | Measurement method | Target / threshold | Conditions / period | Business justification | Traceability |
| --- | --- | --- | --- | --- | --- | --- |
| SC-001 | Members establish and retain access to the correct account through enabled methods and approved recovery/logout routes | Run US-001–US-004 using valid, invalid, repeated, expired and colliding identities; inspect identity and access outcomes | C: no access on invalid evidence and no duplicate identity for an already-associated provider. D/Q: proposed all approved account cases pass; completion-rate target NEEDS CLARIFICATION | Controlled acceptance cases per enabled method; production period TBD | Correct identity is necessary for all member ownership | FR-001–FR-012, FR-047–FR-054; BR-001–BR-006, BR-009–BR-012; SEC-004–SEC-009; INT-001–INT-003, INT-006; CLR-002–CLR-005 |
| SC-002 | Family/couple participation reflects approved relationships and delegated authority | Compare relationship and cross-member outcomes to the approved matrix | C: no unauthorized cross-member access. D/Q: proposed all approved association cases pass; relationship success-rate target TBD | Approved eligible, invalid, duplicate and unauthorized fixtures; review period TBD | Supports grouping without loss of privacy or identity | US-005, US-017; FR-013–FR-014, FR-042; SEC-002; CLR-006 |
| SC-003 | Members can understand their current membership and permitted benefits | Compare membership information and eligibility decisions with approved plan/lifecycle examples | Proposed: exact match in all approved cases; comprehension and journey-completion targets NEEDS CLARIFICATION | Each approved plan/state/benefit boundary, including absence of membership; period TBD | Makes entitlement usable and prevents misleading membership claims | US-006; FR-015–FR-017; NFR-001, NFR-003; CLR-007 |
| SC-004 | Authorized requesters arrange permitted appointments and understand their current state | Run booking and applicable change scenarios, including concurrent requests and unavailable options; compare accepted arrangements to policy | Proposed: no appointment exceeds approved capacity or is assigned to the wrong participant; all approved cases pass. Booking success/time targets TBD | Controlled capacity/time boundaries and approved change policies on selected platforms; period TBD | Supports dependable service access | US-007–US-008; FR-018–FR-022, FR-044–FR-046; EC-018–EC-023; CLR-008–CLR-009, CLR-018 |
| SC-005 | Session outcomes and credits agree with approved participation and entitlement rules | Compare session outcomes and credit balances to expected results from approved grants, consumption, interruptions, corrections and competing uses | Proposed: zero unexplained discrepancies or duplicate deductions in approved acceptance cases; production discrepancy/resolution targets TBD | Known opening entitlement and approved event histories; measurement period TBD | Protects member value and service-delivery accuracy | US-009, US-011; FR-023–FR-024, FR-027–FR-029, FR-045–FR-046; EC-024–EC-028; CLR-010, CLR-012 |
| SC-006 | Program participation is recorded for eligible, correctly identified members | Exercise valid, invalid and repeated enrollment against approved program rules | Proposed: all approved enrollment cases produce their expected outcome; participation/adoption target NEEDS CLARIFICATION | Each in-scope program and applicable boundary; period TBD | Supports reliable structured participation | US-010; FR-025–FR-026, FR-045; EC-029; CLR-011 |
| SC-007 | Payment, purchase fulfillment and billing information accurately represent verified outcomes | Compare controlled confirmed, rejected, delayed, repeated and conflicting payment outcomes with benefits and visible financial information | Proposed: zero false payment-success claims or duplicate purchase effects in approved cases; financial reconciliation timeliness and payment completion targets TBD | Each approved purchase route plus interrupted fulfillment; provider-like evidence is controlled; period TBD | Protects payer confidence and commercial integrity | US-013–US-014, US-006 where linked; FR-033–FR-037, FR-045–FR-046; INT-005; EC-030–EC-034; CLR-014–CLR-015 |
| SC-008 | Members receive accurate event information through approved notifications/reminders | Compare event, recipient, content, timing, attempts and available delivery evidence; test failed delivery and changed appointments | C: no unauthorized recipient disclosure. Proposed: no unsupported delivered claim or knowingly obsolete reminder in approved cases; delivery rate/timeliness thresholds TBD | Enabled channels, approved permissions and changed/cancelled source events; period TBD | Supports attendance and awareness without misleading users | US-008, US-012; FR-030–FR-032; INT-004; EC-035–EC-038; CLR-013 |
| SC-009 | Members can access accurate approved wellness passport information | Compare passport contents with the agreed content set and authoritative source fixtures; test no data and unauthorized viewers | Proposed: exact member/content match in approved cases; user comprehension/usefulness target NEEDS CLARIFICATION | Approved content set for populated and empty passports; period TBD | Makes the named passport capability meaningful without unsupported clinical content | US-015; FR-038–FR-039; SEC-002; CLR-016 |
| SC-010 | Unauthorized users cannot read protected information or perform protected actions | Exercise each approved role/ownership boundary, expired access, forged roles and prohibited sensitive outputs | C: zero unauthorized successes or prohibited secret disclosures in the validation cases; broader security/privacy acceptance criteria TBD | Every selected protected capability and approved role; repeated validation before acceptance, production review cadence TBD | Prevents unauthorized exposure and changes | US-017 and all protected stories; FR-042; SEC-001–SEC-012; NFR-005; CLR-004, CLR-006, CLR-017, CLR-021 |
| SC-011 | Administrators complete essential permitted operations and users can understand/recover from critical failures | Run the approved action matrix and interrupted/conflicting operations; compare known results and linked records | C: failures are not silently hidden and defined business invariants hold. Proposed: all approved recovery/action cases pass; resolution-time and usability targets TBD | Controlled network/provider failures and competing changes; support/measurement period TBD | Makes daily operations workable without inconsistent records | US-016 and affected journeys; FR-040–FR-046; NFR-001, NFR-003–NFR-004; EC-039–EC-044; CLR-017, CLR-022 |
| SC-012 | Initial-release journeys work on both Android and iOS smartphones, with the confirmed responsive behavior and agreed quality expectations | Run each selected story and Section 2.1 interaction scenarios on the agreed representative configurations of both platforms; measure agreed load/network and accessibility conditions | U: both platforms covered, minimum OS versions agreed before acceptance, and required journeys usable with supported screen sizes, system text scaling, keyboard interactions and platform navigation. Neither platform may be excluded without explicit approval. SRC-013 adds screen-reader/focus/contrast/touch/error-recovery expectations and provisional performance/availability targets. Exact matrix, measurable accessibility criteria, target approval/conditions and RTO/RPO remain NEEDS CLARIFICATION | Before release acceptance, evaluate representative screen sizes, resolutions, OS versions and device capabilities on Android and iOS; exact devices, scaling coverage, data volumes, connectivity and observation periods require agreement | Establishes usable access on both intended smartphone platforms and prevents an unapproved platform omission | SRC-011, SRC-013; all selected stories; NFR-002, NFR-004, NFR-006–NFR-007; EC-045–EC-046; CLR-020, CLR-022 |
| SC-013 | Essential behavior can be independently validated with reproducible evidence | Review story coverage and repeat approved acceptance scenarios from controlled starting data | C: deterministic behavioral validation. Proposed: every selected story has executable, passing success/failure evidence and no unresolved essential policy; numerical coverage target beyond this is TBD | After release/policy decisions; acceptance evidence per approved story set | Prevents untestable requirements from being mistaken for delivery | All stories; NFR-008; SRC-008; CLR-001, CLR-022 |

Scope-dependent business adoption, membership conversion, attendance, retention and revenue measures have not been invented. If desired, the decision-maker must define the measure, baseline, target, population, timeframe and data authority under CLR-022; doing so does not automatically approve reporting software.

## 7. Assumptions

### 7.1 Assumption and evidence register

Confirmed facts and approved requirements remain in the source/requirement registers; the table explicitly labels their use where needed. Provisional assumptions and suggested defaults are not business rules. Each may be replaced by approved information without silently rewriting the constitution.

| ID / category | Statement and classification | Reason / evidence | Affected stories / requirements | Risk if incorrect | Confirmation required |
| --- | --- | --- | --- | --- | --- |
| ASM-001 — Product scope | **Provisional assumption:** each capability named in the constitution warrants discovery coverage, but its minimum detailed behavior in this draft is a proposal. **Confirmed fact:** the capabilities are named. | SRC-001 provides names rather than product policies | US-001–US-017; all D/Q requirements | Proposed minimal behavior may differ from the intended product; missing approved documents could change scope | Yes: CLR-001 and capability clarifications |
| ASM-002 — User roles and permissions | **Selected baseline:** MEMBER, OPERATOR, ADMIN; public MEMBER only. **Unresolved:** real action grants and provisioning authority | SRC-013; least privilege | US-001, US-016–US-017; FR-042, FR-052 | Role labels mistaken for blanket powers | Yes for matrix/bootstrap: CLR-017 |
| ASM-003 — Membership and eligibility | **Provisional assumption:** membership information and eligibility must be specified separately; no active-membership prerequisite is assumed for every service | SRC-001 names memberships without linking all benefits | US-006–US-008, US-010–US-011, US-013; FR-015–FR-020, FR-025, FR-028, FR-035 | Wrong entitlement assumptions could deny legitimate use or grant unearned benefits | Yes: CLR-007 |
| ASM-004 — Booking and scheduling | **Provisional assumption:** an appointment identifies a participant, subject and agreed time; who books and what determines availability are open. No operator/equipment scheduling is presumed | SRC-001 names appointments; SRC-010 treats resource scheduling as discovery | US-007–US-008; FR-018–FR-022 | Appointment or availability model may need revision after operational discovery | Yes: CLR-008–CLR-009, CLR-018 |
| ASM-005 — Credits and wellness sessions | **Provisional terminology:** “wellness session” refers to the constitution's session capability without clinical implications. **Unresolved questions:** credit acquisition, units and consumption event | SRC-001 uses “therapy”; SRC-010 prohibits unsupported clinical assumptions | US-009–US-011; FR-023–FR-029, FR-046 | Wrong session meaning or credit model changes ownership, outcomes and balances | Yes: CLR-010–CLR-012 |
| ASM-006 — Payments and billing | **Suggested default, unapproved:** payment outcome and purchase fulfillment should be distinguishable to avoid false success. No payable item, currency, invoice or refund policy is assumed | SRC-001 names commercial capabilities; SRC-005 requires honest failure handling | US-006, US-013–US-014; FR-033–FR-037; INT-005 | Unclear purchase linkage could misrepresent payments or membership activation | Yes: CLR-014–CLR-015 |
| ASM-007 — Authentication and identity | **Current direction:** four supported methods, mandatory phone/applicable email verification, canonical identity and reauthenticated linking | SRC-013 supersedes earlier ambiguity | US-001–US-004; FR-003–FR-012, FR-047–FR-053 | Incomplete verification or inferred sharing could grant access | Provider/field/recovery detail CLR-002–CLR-005; conflict CLR-024 |
| ASM-008 — External services | **Selected:** Twilio Verify, Google/Apple identity. No live Zoho. **Unresolved:** email vendor/payment/general messaging | SRC-013 | US-001–US-004, US-012–US-014; INT-001–INT-006 | Delivery mistaken for proof or assumed provider readiness | Configuration and CLR-024; Twilio choice is settled |
| ASM-009 — Platform compatibility | **Context:** Android/iOS, English, React Native/TypeScript/Expo; Windows/physical iPhone/no Mac; Expo Go initially, EAS development builds for necessary native/OAuth validation | SRC-013 | Selected stories; NFR-006–NFR-007; SC-012 | iPhone-only evidence leaves Android untested | OS/device/accessibility matrix and account/signing setup CLR-020 |
| ASM-010 — Operational processes | **Suggested default, unapproved:** unknown critical outcomes should be visible and have an agreed resolution responsibility. No support team, service hours, audit product or resource workflow is presumed | SRC-005 forbids silently hiding failures; SRC-001 names administration | US-007–US-016; FR-040–FR-046; NFR-004 | A formally correct error may still leave members or staff unable to complete operations | Yes: CLR-017–CLR-019, CLR-022 |
| ASM-011 — Release boundaries | **Selected:** bounded auth slice, one story at a time; family/delegation/advanced features deferred. Full product matrix and P0 proposal still unapproved | SRC-013 | All stories; FR-047–FR-054 | Planning mistaken for commercial approval | Yes: CLR-001 |
| ASM-012 — Data availability and migration | **Confirmed task context:** the implementation is restarting. **Provisional assumption:** no historical data can be presumed available or absent; controlled data is suitable only for independent validation | SRC-010; only constitution.md was present before this specification | All data-bearing stories; FR-001–FR-002, FR-007, FR-013–FR-041, FR-046 | Lost continuity, wrong opening credits or missing financial/member records at launch | Yes: CLR-023 |

### 7.2 Requirements Traceability and Completeness Review

The matrix links every covered product capability to its evidence, proposed behavior, safeguards, exceptions, concepts, measurements and open decisions. Section 4 preserves the classification of each requirement. Cross-cutting FR-042–FR-046, SEC-001–SEC-003, SEC-010–SEC-012 and NFR-001–NFR-008 apply where relevant rather than being repeated as new feature requirements.

| Capability / source | Stories | Functional requirements | Rules / security / integration | Edge cases | Entities | Success criteria | Clarifications |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Individual accounts and profiles; SRC-001–SRC-004 | US-001 | FR-001–FR-002, FR-043 | BR-001, BR-007–BR-008; SEC-001–SEC-003 | EC-001–EC-004, EC-012 | ENT-001–ENT-002, ENT-005 | SC-001, SC-010 | CLR-002–CLR-005, CLR-021 |
| Authentication and identity; SRC-002 | US-002–US-004 | FR-003–FR-012 | BR-001–BR-006; SEC-004–SEC-009; INT-001–INT-003, INT-006 | EC-005–EC-013 | ENT-002–ENT-004 | SC-001, SC-010 | CLR-003–CLR-005, CLR-020 |
| Family/couple accounts; SRC-001, SRC-003 | US-005 | FR-013–FR-014 | BR-001, BR-007; SEC-002 | EC-016–EC-017, EC-038 | ENT-001–ENT-002, ENT-006 | SC-002, SC-010 | CLR-006, CLR-021 |
| Memberships and plans; SRC-001 | US-006 | FR-015–FR-017 | BR-007–BR-008; SEC-002 | EC-014–EC-015, EC-023 | ENT-007–ENT-008 | SC-003 | CLR-007, CLR-012, CLR-014 |
| Appointments; SRC-001, SRC-004, SRC-007 | US-007–US-008 | FR-018–FR-022 | BR-007–BR-008; SEC-002 | EC-018–EC-023, EC-037 | ENT-009 | SC-004 | CLR-007–CLR-009, CLR-018 |
| Wellness sessions; SRC-001 | US-009 | FR-023–FR-024 | BR-007–BR-008; SEC-002–SEC-003 | EC-023, EC-026–EC-027 | ENT-010 | SC-005 | CLR-010, CLR-012, CLR-017 |
| Programs and enrollment; SRC-001 | US-010 | FR-025–FR-026 | BR-007–BR-008; SEC-002 | EC-015, EC-029 | ENT-011–ENT-012 | SC-006 | CLR-011 |
| Session credits; SRC-001, SRC-007 | US-011 | FR-027–FR-029 | BR-007–BR-008; SEC-002 | EC-024–EC-028 | ENT-013–ENT-014 | SC-005 | CLR-006–CLR-007, CLR-010–CLR-012 |
| Notifications/reminders; SRC-001, SRC-005 | US-012 | FR-030–FR-032 | BR-007; SEC-002, SEC-010; INT-004 | EC-035–EC-038 | ENT-017 | SC-008 | CLR-009, CLR-013, CLR-021 |
| Payments; SRC-001, SRC-005, SRC-007 | US-013 | FR-033–FR-035 | BR-007–BR-008; SEC-010; INT-005 | EC-030–EC-033 | ENT-015 | SC-007 | CLR-014–CLR-015 |
| Billing/transactions; SRC-001 | US-014 | FR-036–FR-037 | BR-007; SEC-002; INT-005 | EC-031, EC-034 | ENT-016 | SC-007 | CLR-015, CLR-021 |
| Wellness passport; SRC-001 | US-015 | FR-038–FR-039 | BR-007; SEC-002 | EC-012, EC-043–EC-044 | ENT-018 | SC-009 | CLR-016, CLR-021 |
| Administration; SRC-001, SRC-003 | US-016 | FR-040–FR-041 | BR-007–BR-008; SEC-003 | EC-012, EC-028, EC-041–EC-042 | ENT-019 and permitted subjects | SC-010–SC-011 | CLR-017 |
| Protected access; SRC-002–SRC-003, SRC-006 | US-017 | FR-042 | BR-006–BR-007; SEC-001–SEC-012 | EC-005–EC-013, EC-017, EC-038, EC-044 | ENT-002–ENT-004, ENT-019 | SC-010 | CLR-004–CLR-006, CLR-017, CLR-021 |
| Validation, integrity and recovery; SRC-004–SRC-008 | All applicable stories | FR-043–FR-046 | BR-008; NFR-001–NFR-005, NFR-008 | EC-001–EC-004, EC-021, EC-026, EC-032, EC-039–EC-044 | Affected business concepts | SC-011–SC-013 | Applicable policy questions; CLR-022–CLR-023 |
| Compatibility/accessibility; SRC-009–SRC-011; both smartphone platforms and responsive interactions confirmed | All selected stories and Section 2.1 shared scenarios | Cross-cutting behavior; no new business capability | NFR-006–NFR-007 | EC-045–EC-046 plus applicable integration/access cases | No additional entity | SC-012 | CLR-020 partially resolved; minimum OS versions, matrix and remaining accessibility criteria open |
| Operators/equipment/calendars; task checklist only | None committed | None committed beyond conditional appointment capacity | No invented operational rules | EC-020 flags scope gap | None approved | SC-004 only if adopted | CLR-018 |
| Dashboard/reporting; task checklist only | None committed | None committed | No invented analytics requirement | Scope decision needed before scenarios | None approved | No unsupported business KPI | CLR-019 |
| Historical release, account and security proposals; SRC-012, superseded where SRC-013 decides | US-001–US-004, US-016–US-017 plus candidate release coverage in CLR-001 | Historical context only; current decisions in SRC-013/CLR-001–CLR-008 govern | Existing constitutional rules remain binding; proposed refinements are labeled P | Conditional cases in CLR-002–CLR-004; policy bounds remain open | Existing identity/profile concepts; proposed role/catalog/tracking extensions not approved | SC-001, SC-010, SC-013 after policy approval | CLR-001–CLR-005, CLR-008, CLR-010, CLR-012, CLR-016–CLR-017 |
| Consolidated authentication baseline; SRC-013 | US-001–US-004, US-017 | FR-047–FR-054 plus updated FR-003–FR-012 | BR-009–BR-012; SEC-005, SEC-009; INT-003, INT-006 | EC-047–EC-051 | ENT-002–ENT-004, ENT-019 | SC-001, SC-010, SC-012–SC-013 | CLR-001–CLR-008, CLR-017, CLR-020–CLR-024 |

Completeness findings:

1. **Confirmed product-capability coverage:** every capability explicitly named in the constitution has a story and requirement reference. A confirmed *release* capability set does not yet exist; CLR-001 blocks release-completeness certification.
2. **Story validation:** all 17 stories contain metadata, a user-value statement, preconditions, Given/When/Then scenarios and an independent validation method with observable success/failure conditions. Conditional scenarios remain unusable as final product acceptance until their referenced policies are approved.
3. **Functional traceability:** all 54 functional requirements reference evidence and relevant stories; D/Q classifications identify behavior inferred or still awaiting approval rather than presenting it as established policy.
4. **Rule coverage:** all 12 source-classified business rules map to functional/security obligations. Missing commercial and operational policies are questions, not invented rules.
5. **Exceptional conditions:** all 51 edge cases identify triggers, system and visible outcomes, related behavior and clarification status. Platform and interaction cases reflect SRC-011/SRC-013; undocumented resources and policies remain explicitly conditional.
6. **Business concepts:** all 19 conceptual entities relate to named capabilities or necessary identity/access concepts. Selected OPERATOR role does not imply an approved service catalog, scheduling/equipment workflow, invoice or clinical capability.
7. **Measurable outcomes:** all 13 success criteria identify a method, target status, measurement conditions, justification and traceability. Proposed acceptance targets are separated from constitutional obligations and missing production targets.
8. **Clarification status:** 24 entries reflect SRC-013: verification/password/reset rules and selected methods/roles/workflow are recorded. Provisional security, retention and quality values remain review-dependent. CLR-024 records the Twilio/constitution conflict; no amendment is claimed.
9. **Deferred and excluded scope:** no capability is represented as source-approved Phase 2 or silently omitted. Unknown candidates and unsupported clinical functionality are identified in Section 1.2 and the matrix.
10. **Document boundary:** the specification defines business behavior and inherited constraints without source code, architecture design, schemas, API contracts, screen layouts, implementation tasks or a development plan. Implementation organization is documented separately in plan.md; constitution.md remains unchanged.

**Readiness conclusion:** consolidated authentication behavior is substantially defined. Production parameters, permissions, onboarding fields and commercial/privacy/operational approvals remain open. Resolve CLR-024 before implementing delegated OTP generation/checking; constitution.md is unchanged. No full-product or production readiness is claimed.
