# DEV-011 account persistence review

R2-A/B/C were explicitly approved by the owner on 2026-10-13. This review precedes isolated migration application. DEV-010 implementation prerequisites are closed; actual provider/deployment/history/device evidence remains gated separately.

The schema adds only DEL-002 account establishment: member profile/verified canonical contacts, method-to-internal-user associations, purpose-limited pending registration, Twilio reference/status metadata, protected registration-email verifiers and shared abuse events. Existing user/session UUIDs and relationships are preserved. Existing users remain ONBOARDING with no inferred verification or granted access. No password, refresh, OTP value/verifier, birth date, guardian data or role action matrix is introduced.

| Design | Integrity / query rationale |
| --- | --- |
| User verified phone/email | Nullable unique canonical fields; a contact and verification timestamp must be present together. Pending destinations cannot reserve member contacts. Active account requires completed profile, phone, primary method and applicable verified email. |
| User role | MEMBER database default; client input never supplies it. OPERATOR/ADMIN provisioning is a later controlled workflow. This migration assigns no privileged user. |
| UserIdentity | Unique method/subject prevents duplicate canonical identities for verified primary evidence. Unique user/method prevents ambiguous associations. Subject is opaque except email/phone canonical rules, handled by trusted services. |
| PendingRegistration | Independent capability verifier, status, explicit expiry, profile and destination binding. No normal-access session is issued here. Terminal completion links to the resulting stable internal UUID; late/repeated operations cannot create another member. |
| PhoneChallenge | Registration purpose only; provider reference/service/destination/context, attempts, expiry/status. Partial unique index permits one active challenge per phone across pending contexts. Expired/indeterminate provider state must be reconciled before reuse. No generated/stored/hashed OTP. |
| RegistrationEmailAuthorization | Registration purpose only, SHA-256 verifier, immutable destination/context, generation, issuance/expiry and single-use state. Unique pending/generation and conditional writes enforce latest-only acceptance. Supersession/consumption removes usable verifier. Delivery state is separate from verification authority. |
| RegistrationRateEvent | HMAC bucket plus configured key ID/operation/time; no raw IP/contact. Index supports bounded shared rolling-window counts. Retention has an indexed time predicate. |
| Cleanup | Pending children cascade only when their pending record is deliberately purged. Stable identities use restrictive foreign keys; no implicit member/session deletion. Expiry indexes support approved retention without a full-table scan. |

Migration-only PostgreSQL CHECK constraints and a partial unique index are justified because Prisma cannot express these invariants in schema syntax. These are controlled static DDL, not interpolated request SQL. Application checks and conditional transactions still enforce cross-row method/pending/verification transitions. SQL review covers canonical formats, timestamp coherence, positive bounded attempts/generations, hash formats, fixed purpose and active-member prerequisites. Production target/history initialization remains unapproved; only the guarded synthetic database is migrated.
