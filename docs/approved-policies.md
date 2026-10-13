# Approved execution decisions — 2026-10-13

## Authority and precedence

The requesting project owner authorized every task in tasks.md and then stated, “I own all three,” in response to product-decision, security/privacy-review and phase-exit ownership. The project owner is therefore the accountable owner of those decisions and exits for this execution. Codex implements and prepares technical review evidence; the owner requested technical review first, then approved the presented choices with “all revisions are approved.”

This record captures the owner’s explicit decisions from the implementation conversation. These newer directions supersede conflicting prior proposals within their stated scope. It does not approve unanswered policies, actual provider credentials, production deployment, device results, legal compliance or completed phase exits. The original source documents retain their historical classifications; this record is the current execution overlay.

## Accepted product boundaries

| Area | Approved direction | Affected tasks |
| --- | --- | --- |
| Profile | Require full/display name, 1–100 Unicode code points after trimming leading/trailing whitespace, consistent with the subsequently approved R1 counting proposal. No optional demographic information is required. | DEV-010–DEV-017 |
| Phone | Valid India (+91) phone number and successful phone verification for every registration method. Canonical phone uniqueness must be enforced; no duplicate identity from repeated/concurrent verification. | DEV-011–DEV-013, DEV-015, DEV-020, DEV-027 |
| Email/password registration | Require email and successful email verification before normal protected access. | DEV-011–DEV-017, DEV-019 |
| Google/Apple registration | Use verified provider identity evidence; populate available profile information. Required phone/name completion still gates normal member access. | DEV-015, DEV-021–DEV-025 |
| Onboarding | A first sign-in for a new identity begins onboarding; existing members sign in normally. This clarifies the owner’s earlier “When signing in create it as onboarding.” It does not bypass required verification or authorize duplicate account creation. | DEV-015–DEV-017, DEV-024–DEV-025, DEV-039 |
| Email comparison | Trim exterior whitespace and lowercase for canonical comparison/lookup/uniqueness. Preserve dots and plus-addressing suffixes; no provider-specific rewrite. | DEV-011–DEV-012, DEV-019, DEV-027, DEV-036 |
| Identity linking | Enforce uniqueness of approved canonical phone/email identifiers. Do not merge on an unverified matching phone/email. Existing-account reauthentication and additional-method proof remain required by the prior source. | DEV-011–DEV-012, DEV-027–DEV-028 |
| Password length | Minimum 12, maximum 128 Unicode code points; no arbitrary uppercase/lowercase/digit/symbol rules. Never trim or normalize passwords. This supersedes SRC-013’s earlier minimum of 8; counting semantics were expressly approved in the follow-up technical review. | DEV-019, DEV-037; VAL-003, VAL-017 |
| Password reuse | Reject reuse of the current password; no longer password history without another requirement. | DEV-037 |
| Password implementation | Maintained `argon2@0.45.1`, Argon2id candidate: 65,536 KiB memory, 3 passes, parallelism 1, 32-byte hash and library-generated random salt. Owner approved this candidate for calibration. Deployment latency/memory measurement at agreed concurrency is still required before activation. Store only hash and necessary metadata; never return/log passwords or hashes. | DEV-018–DEV-019, DEV-031, DEV-037 |
| Roles | MEMBER, OPERATOR, ADMIN only for now. The owner explicitly withdrew the ambiguous SUPER_ADMIN addition in the follow-up reply. | DEV-011, DEV-040–DEV-045 |
| Grants | Public registration assigns MEMBER only; submitted roles are never authoritative. MEMBER accesses only its permitted resources. OPERATOR/ADMIN require controlled, auditable provisioning. Actual action/subject grants and bootstrap authority remain open. | DEV-015–DEV-016, DEV-041–DEV-043 |
| Email integration | Owner directed use of Resend as the proposed delivery provider for verification and recovery. This supports preparing its adapter within the authorized task scope once prerequisites are met. Secrets, sending domain, sender, lifecycle and deployment configuration remain required before actual activation. | DEV-014, DEV-036 |

## Approved constitutional exception — EXC-001 / CLR-024

| Governance field | Record |
| --- | --- |
| Approval source and date | Explicit project-owner approval in the implementation conversation, 2026-10-13 |
| Rule affected | constitution.md, OTP Authentication: “OTP generation and verification must occur on the backend.” |
| Scope | Phone verification through Twilio Verify, brokered exclusively by NestJS |
| Justification | Use the selected maintained verification provider for SMS code generation/checking while retaining backend application identity and authorization authority |
| Affected components | Backend configuration, authentication/verification adapter, identity/pending-onboarding state, rate controls, verification persistence and mobile API interaction; DEV-013, DEV-015, DEV-020 and approved association consumers |
| Impact | Delegate code generation/checking only. Provider approval is evidence for a separately validated local transition, never standalone application authentication. |
| Duration | Ongoing for the expressly selected Twilio phone-verification design; this exception has no broader provider/feature applicability. Replacing the provider or weakening these constraints requires review. |
| Compatibility | No existing application or credential migration is present. Do not implement a local OTP fallback or infer verified contacts from historical exports. |
| Constitutional document | Base version 1.0.0 remains unchanged; this is an explicitly recorded exception under Exception Governance, not an implicit amendment. |

The owner approved the following mandatory constraints:

1. Twilio Verify generates and checks SMS codes.
2. NestJS validates the requested operation, identity or pending-registration context, verification purpose, India country eligibility and rate controls.
3. Mobile sends phone/code to NestJS and does not call Twilio directly.
4. NestJS decides whether trusted provider approval permits the intended local transition.
5. AAYUVYA never generates, persists, returns or logs OTP values. Entered codes exist only transiently for transmission to the provider. Persist only necessary provider references, status, purpose, timestamps and abuse metadata.
6. Provider delivery success alone never authenticates or grants protected access.
7. Bind successful verification to the intended phone, operation and pending identity. Repeated/concurrent requests cannot create duplicate identities or repeat sensitive effects.

CLR-024’s constitutional ownership conflict is resolved for this bounded design. DEV-013 still depends on accepted foundation/account prerequisites and reviewed rate/provider expiry/resend settings. This exception does not itself complete DEV-010 or configure Twilio.

## Decisions still required

### Subsequent owner decisions recorded on 2026-10-13

- Age eligibility: the earlier 13+ threshold is superseded by the owner's latest “Skip age restriction for now.” No age gate or age/birth-date/guardian-data collection is implemented in this slice. This does not approve unrelated demographic collection or resolve the remaining release privacy review.
- Registration-email authorization expires five minutes after NestJS issues it; resend becomes available after 30 seconds. The owner approved immediate invalidation of all earlier authorizations on resend, latest-only acceptance and single-use consumption.
- Replacement phone/email must be successfully verified before replacing the existing verified contact. Existing-account ownership/reauthentication and canonical uniqueness safeguards remain in force.
- The owner replied “I approve” to the session-policy question. The stated plan settings are now approved: RS256, 15-minute access JWT, 30-day inactivity and five active sessions. The reply does not supply values or race/eviction/key-handling definitions that the plan explicitly left unspecified; those remain required before activation.
- The owner explicitly approved the provisional OTP limits: five failed checks per verification, 60-second request cooldown and five requests per phone per rolling hour. Provider expiry/resend behavior, other operation limits, network dimensions and retention remain separate decisions.

- Technical baseline R1 is approved by the later owner reply, “all revisions are approved,” on 2026-10-13. DEV-002 is complete and DEV-003 workspace installation/scaffolding is authorized. This supersedes the earlier revision request. Unpresented policy values are not inferred from this technical approval.
- Actual Resend sender/domain/secrets/deployment configuration. Registration-email expiry-start, resend/supersession and single-use policy are approved above.
- Contact replacement/recycled-phone handling, collision recovery and association proof recency/binding; assisted-resolution disposition.
- Deployment calibration of the approved Argon2id candidate. Password code-point counting and no trimming/normalization are approved; no benchmark result is claimed.
- Provider OTP expiry/resend alignment and remaining operation/IP limits/topology/proxy policy. Five failed OTP checks, 60-second cooldown and five phone requests/hour are approved above.
- JWT issuer/audience/key lifecycle/clock; inactivity activity definition, cap outcome and security-event semantics; refresh lifetime/family/replay/concurrency/lost-response behavior; reset session effects and logout-all disposition. The stated RS256/15-minute/30-day/five-session settings above are approved.
- Privileged authentication methods, actual action/subject matrix, provisioning/bootstrap/change authority and audit policy.
- Retention/consent/deletion/privacy approval, historical-data continuity, acceptance measurements, supported OS/device/accessibility matrix and actual provider/signing/build setup.

Each remains mapped to its DEC identifier and first dependent task in [execution-register.md](execution-register.md). Work proceeds in task dependency order. No acceptance is based on unanswered questions or unapproved numerical fixtures.

## Accepted foundation exit and account-readiness review

On 2026-10-13 the owner explicitly selected “Accept foundation exit; retain listed release-remediation gates” after reviewing the IT-003 candidate in foundation-validation.md. IT-003/DEL-001 are closed. The listed dependency findings remain unresolved release-remediation gates; no vulnerability fix, deployment approval or later phase exit is inferred. This supersedes earlier pending-owner-review status for IT-003.

The owner subsequently approved R2-A, R2-B and R2-C explicitly on 2026-10-13. [Approved account readiness R2](account-readiness.md) now governs the bounded phone expiry/recovery, registration abuse/privacy/retention and technical capability/email/transport/normalization implementation. DEV-010 implementation entry is complete. Actual providers, production target/history, key-rotation configuration and real platform acceptance remain separate gates; their success is not inferred from the approval.
