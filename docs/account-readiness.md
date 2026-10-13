# DEV-010 account-establishment readiness — approved R2

Prepared 2026-10-13, Asia/Calcutta. The owner explicitly approved R2-A, R2-B and R2-C in response to the three review questions. DEV-010 implementation prerequisites are closed. Values below are approved for the bounded DEL-002 implementation; live providers, production initialization and real platform acceptance retain their separate gates. Historical proposal wording records what was reviewed and does not negate this approval.

## Newly accepted decisions

| Decision | Owner direction and effect | Tasks |
| --- | --- | --- |
| IT-003 exit | “Accept foundation exit; retain listed release-remediation gates.” Foundation checks/reviews are accepted. Dependency findings remain tracked for release remediation, not silently marked fixed. | DEL-002 entry; later DEV-047/IT-026 review |
| DEC-003 age | “Skip age restriction for now.” This supersedes the earlier 13+ threshold. Do not implement an age gate or collect birth date, age declarations or guardian information in this slice. This does not approve unrelated demographic collection or resolve every privacy/deployment requirement. | DEV-011–DEV-017 |
| DEC-012 registration email | Expiry begins when NestJS issues the authorization; every resend immediately invalidates previous authorizations; only the latest authorization can be consumed, once. The previously accepted five-minute expiry and 30-second resend wait remain in force. | DEV-011, DEV-014–DEV-017 |

Existing accepted requirements remain: trimmed display name of 1–100 Unicode code points; India phone only, verified for every registration method; email/password requires a verified canonical email; verified provider identity begins onboarding for a new identity; existing members sign in normally. Public creation assigns MEMBER only. Contacts are unique in their verified canonical form; matching unverified identifiers never merge accounts. New replacement contacts require verification before replacing existing verified contacts. Resend is the selected proposed delivery integration; EXC-001 permits the bounded Twilio delegation.

## Entry and decision matrix

| Gate | Current evidence | Remaining before dependent work |
| --- | --- | --- |
| IT-003 | Owner explicitly accepted the supplied candidate/exit | Closed; release findings retained |
| DEC-003 profile/country/age | Owner field, normalization, country and latest no-age-gate decisions recorded | R2 pending-context technical contract below |
| DEC-004 contacts/collisions | Verified canonical uniqueness, no unverified merge, verified replacement; source requires conflict to stop | Implement collision refusal, never automatic account merging. Assisted recovery, recycled-phone exception and linking proof recency remain DEV-026/DEV-030 decisions; no such workflow is introduced here |
| DEC-005 credentials | Password limits/counting and Argon2id candidate approved | Real credentials and calibration remain DEV-018/DEV-019; DEL-002 uses isolated primary-authentication fixtures only |
| DEC-006 Twilio | EXC-001 and five failures / 60-second cooldown / five phone requests per rolling hour approved | Approve R2 expiry, resend binding and indeterminate-result recovery; securely configure actual service for integration |
| DEC-007 abuse controls | Phone limits approved; no permission to invent other numeric limits | Approve R2 registration/email/IP limits, shared enforcement and trusted-proxy boundary |
| DEC-012 email | Five minutes, 30-second resend, latest-only/single-use/from-issuance accepted | Review R2 technical proof/delivery handling; real sender/domain/secrets must be configured before delivery integration acceptance |
| DEC-016 privacy/data retention | Minimal profile/contact collection and essential verification messages; safe diagnostics; no demographics | Approve limited R2 metadata retention and messaging policy; release privacy/deletion review remains explicit |
| DEC-018 historical continuity | No live Zoho integration or existing application data found in this workspace | Owner must select new empty-database initialization or separately reviewed historical continuity before production initialization. Isolated synthetic migrations do not choose this |

## R2-A: proposed phone-verification policy

This section needs owner approval under DEC-006/DEC-007.

1. Use a reviewed Twilio Verify service configured for a **10-minute** code validity period. Local challenge acceptance cannot exceed that period; resend does not extend the original local expiry. Twilio documents a default ten-minute validity and reuse of a code during its validity until successful verification. [Twilio validity/resend documentation](https://www.twilio.com/docs/verify/api/rate-limits-and-timeouts).
2. Keep at most one active registration challenge for a canonical phone and its bound pending context. Another context may not adopt its challenge or provider reference. A resend within that context uses the same purpose/binding and may deliver the same provider code. Changed phone/context invalidates local acceptance of prior evidence; cancel/reconcile the old provider challenge before beginning another bound challenge. Refuse unresolved conflicts rather than granting access.
3. Apply the already approved five failed checks, 60-second phone cooldown and five phone requests per rolling hour. Reserve shared attempt/request budgets before outbound work so concurrency cannot exceed the limits. Failed or indeterminate delivery attempts consume their request budget; an indeterminate check consumes its reserved check budget to prevent timeout-based bypass. No OTP value is retained, hashed, echoed or logged.
4. Confirm provider service, verification reference, destination, SMS channel and approved status against the stored binding. A provider response permits only the associated local verification transition. Local completion is conditional and idempotent; delivery alone grants nothing.
5. If the provider outcome cannot be safely reconciled, keep local access pending and require a fresh verification after cancellation/expiry. Do not replay a consumed result to create an account or session. A stored, trusted approved result may retry only its original local transition, once; never change its phone, context or purpose.

The actual service configuration and cancellation/check behavior must be validated with isolated Twilio evidence in DEV-013/IT-005. This proposal does not call the provider or claim credentials are configured. [Twilio verification API](https://www.twilio.com/docs/verify/api/verification), [verification-check API](https://www.twilio.com/docs/verify/api/verification-check).

## R2-B: proposed registration abuse/data policy

This section needs owner approval under DEC-007/DEC-016. The values are review candidates, not inferred defaults.

| Operation / data | Proposed boundary |
| --- | --- |
| Begin registration | Five requests per source IP per rolling hour |
| Phone send/resend | Existing phone limits plus five per pending context/hour and 20 per source IP/hour |
| Phone checks | Existing five failed checks per challenge plus 20 submissions per source IP/minute |
| Registration-email issue/resend | Existing 30-second wait; five per canonical destination/hour, five per pending context/hour and 20 per source IP/hour |
| Email authorization submissions | Ten per pending context/minute and 20 per source IP/minute |
| Provider outage | Safe unavailable/pending outcome; no fail-open path, retries that exceed budgets or automatic identity creation |
| Shared counters | PostgreSQL transactions/conditional writes across instances; no process-local claim of global limits, Redis or new infrastructure |
| Network identity | Direct deployment uses the actual socket peer. Proxied deployment requires explicit trusted proxy CIDRs/configuration before activation; arbitrary forwarded headers never choose the rate-limit identity |
| Abuse identifiers | Purpose-separated HMAC-SHA-256 identifiers for canonical destination/IP, with deployment secret and key ID; never log raw IP/contact values. Key changes require a reviewed rotation that preserves active rate windows |
| Rate records | Purge after 25 hours; failed/indeterminate operations count as stated above |
| Pending registration | Authorization expires after 30 minutes. Remove abandoned pending profile/contact/verification data within seven days after expiry |
| Completed/superseded/expired verification records | Purge challenge references and protected email verifiers after 24 hours; remove usable proof at consumption/invalidation immediately |
| Member contacts/profile | Keep while the account is active; require approved deletion/privacy handling before production release. This does not select retention for historical users or privileged audits |
| Messaging consent | Only explicitly requested essential verification messages; no marketing enrollment or demographic collection. Provider-required SMS opt-in must be represented in the verification request/UI and reviewed deployment configuration |

Login, provider exchange, linking, recovery/reset and privileged-operation budgets remain their later tasks; this proposal does not activate those methods. Diagnostic/audit retention beyond this new registration metadata remains the existing release/privacy gate.

## R2-C: technical implementation proposal

The owner previously requested technical choices for review before implementation. This section supplies that review for DEV-011–DEV-017; no packages, schema changes or account code are installed/implemented by this proposal.

- Keep the approved Nest/Prisma/PostgreSQL and Expo structure. Add only account, verified-contact, pending-context and registration-verification responsibilities needed by DEL-002. Migrations must preserve the existing UUIDs/session relationships. Conditional uniqueness and transactions prevent concurrent verified-contact claims from producing duplicate identities. Schema design/SQL review precedes isolated migration application in DEV-011.
- Pending registration uses a cryptographically random **256-bit opaque capability**, with only a SHA-256 verifier stored, bound to its pending context and 30-minute expiry. It permits approved onboarding operations only; it cannot satisfy normal member authentication or authorization. Generate randomness/hash using Node's maintained `node:crypto` APIs, never custom cryptography. Rotation/cancellation invalidates its previous verifier. No password, provider token or private credential appears in response DTOs or diagnostics.
- Registration email uses a separate random **256-bit opaque authorization**, with a purpose-bound SHA-256 verifier, canonical destination, context, issuance/expiry, latest generation and single-use conditional consumption. No numeric email OTP is proposed. NestJS alone issues/verifies the authorization. Delivery receives the plaintext only transiently; persistence retains no usable token. Implement the approved issue-time expiry and immediate supersession even if the new email cannot be delivered. A failed delivery leaves the latest attempt pending/unavailable; it does not reactivate an older authorization.
- Use official Twilio/Resend REST endpoints through the approved Node runtime's maintained `fetch`, with a proposed **10-second provider deadline**, fixed configured hosts, server-only credentials, bounded response contracts and safe errors. No additional provider SDK is needed. Email content/sender and app link routing require reviewed configuration; the backend must never build a verification URL from caller-supplied host/redirect data. Outbound operations require idempotency/reconciliation where supported and no automatic sensitive retry.
- Propose `libphonenumber-js@1.13.15`, using its `max` metadata for phone normalization/validation; npm registry version checked on 2026-10-13. Review the [maintainer documentation](https://github.com/catamphetamine/libphonenumber-js) and verify the locked package on the approved Node 24 runtime before acceptance. Do not implement numbering-plan validation by hand or rely only on a `+91` regex. Parse canonical E.164 and validate India eligibility; reject invalid numbers before provider work. SMS delivery still requires actual provider evidence. Email comparison remains trim/lowercase without dot/plus transformations.
- Primary authentication remains a **test-module substitute** until DEL-003 supplies actual password/OTP/Google/Apple trust. No production fixture route, arbitrary method-evidence DTO or `verified=true` bypass is allowed. Onboarding access and member access remain separate backend boundaries. DEV-016 operations stay inactive until their real caller-evidence and provider/security activation configuration exists; unit/API fixture tests are labeled accordingly.
- Use the existing transport, SecureStore, feedback and access-boundary libraries for the register/verify screens. No dashboard, unrelated profile feature, age screen or future authentication method implementation is added. No new signing/build account is activated.

Real provider configuration must be supplied via environment secrets/approved deployment configuration, not chat or source. Actual provider/Expo Go/device cases remain DEV-013/DEV-017/IT-005–IT-007 evidence. Current foundation dependency findings remain release-remediation gates accepted at IT-003.

## Current execution disposition

DEV-010 is **complete for implementation entry**: IT-003 and R2-A/B/C have attributable owner acceptance. DEV-011–DEV-017 proceed in dependency order. Real provider readiness, production target/history initialization, key rotation/deployment configuration and platform evidence remain explicit activation/integration/release gates; no unavailable live result is claimed. Constitution/specification/plan source documents remain unchanged.
