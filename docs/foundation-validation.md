# DEL-001 implementation and validation — 2026-10-13

DEV-001–DEV-009 are implemented within the foundation scope. IT-001 and IT-002 foundation integration cases pass. The accountable owner accepted IT-003 with the listed release-remediation gates retained on 2026-10-13. DEL-001 is closed; DEV-010 prerequisite work is active. Account implementation has not begun. This is not completed registration, authentication, account association, recovery or production authorization.

The owner approved all tasks and the presented technical revisions. [Approved policies](approved-policies.md) capture subsequent age, email, contact, session and OTP directions. [Technical baseline](technical-baseline.md) and [persistence review](persistence-foundation.md) explain the reviewed choices. Source constitution/specification/plan files remain unchanged.

## Candidate and environment

Windows, Node `24.16.0`, npm `11.13.0`; separate mobile/backend lockfiles. The workspace has no Git repository, so no commit or branch is claimed. [File inventory](foundation-files.md) lists every created/modified deliverable and records a SHA-256 snapshot of application/configuration/test/migration files. Generated clients, dependencies, bundles, caches and private local environment files are excluded.

PostgreSQL `18.6-alpine` runs in a workspace-labeled Docker fixture on loopback `127.0.0.1:54329`, database `aayuva_test`. Credentials were randomly generated and kept only in ignored `.env.database.local`; no credentials appear in this report. Docker startup and local compiler execution required sandbox escalation and succeeded. No production database, signing account, external provider delivery or deployed application was used.

## Implemented scope and source evidence

| Task | Deliverable | Requirements / VAL | Evidence |
| --- | --- | --- | --- |
| DEV-001–DEV-002 | Decision/traceability register, accountable owners, approved stack and placement | SRC-013; plan Sections 1–3, 9; constitutional governance | execution-register.md, approved-policies.md, technical-baseline.md |
| DEV-003 | Nest modular bootstrap, Expo Router title screen, strict compiler/lint/test/build configuration and lockfiles | Constitutional architecture/coding/frontend/testing rules | backend/test/bootstrap.spec.ts; mobile/__tests__/entry.test.tsx; passing builds below |
| DEV-004 | Required environment identity, validated ports/URLs/docs activation, inactive authentication flags, public-only Expo settings | SEC-010–SEC-012; plan Section 8.2; VAL-012/VAL-015 foundation | backend/test/environment.spec.ts; mobile/__tests__/environment.test.ts |
| DEV-005 | DTO allowlist validation, generic error envelope, server-generated request IDs, diagnostic field allowlist and accessible feedback states | FR-043–FR-044; SEC-010–SEC-012; VAL-012 | backend/test/diagnostics.spec.ts; mobile/__tests__/feedback.test.tsx |
| DEV-006 | UUID identity/session schema, foreign key/index, migration and injected Prisma/Pg service | Plan Section 5; constitutional Database Rules; VAL-015 | prisma/schema.prisma, migration SQL, persistence-foundation.md, real database cases |
| DEV-007 | Trusted RS256 verification primitive, authoritative session checks, monotonic owner-bound revocation, separate global guards and denying defaults | FR-011/FR-042; SEC-001–SEC-003/SEC-009/SEC-012; VAL-007/VAL-010–VAL-012 foundation | backend/test/access-verification.spec.ts, access-guards.spec.ts; database repository case |
| DEV-008 | Typed safe transport, serialized native credential access, backend-decision boundary with stale-response protection | FR-044; NFR-001/NFR-005–NFR-007; VAL-013 foundation | mobile/__tests__/api-client.test.ts, credential-store.test.ts, access-boundary.test.tsx |
| DEV-009 | Explicit fixture clock, fake mobile timers, test-only provider/storage/fetch substitutes, guarded database URL and cleanup, documented commands | Plan Section 10.1; constitutional Testing Rules; VAL-015 | backend/test/helpers/clock.ts, database-guard.spec.ts; package scripts and READMEs |
| IT-001 | Actual Nest/Supertest validation, rejection, guard, diagnostic and exception paths | Foundation portions VAL-007/VAL-010–VAL-012 | Backend unit/request suite; crypto and session tests labeled fixtures |
| IT-002 | Real migration/constraint/transaction/concurrency checks plus isolated mobile boundaries | Foundation portions VAL-013/VAL-015 | Database suite and mobile suite |

## Commands and observed results

Run from the relevant package directory using the README setup steps. Backend installation must be followed by `npm run database:generate`. Test fixtures never supply production policy defaults.

| Command | Observed result |
| --- | --- |
| backend: `npm run check` | Lint, strict TypeScript, 6 suites / 68 tests, and compiled backend build pass |
| backend: `npm run database:generate` | Prisma 7.10 client generated from reviewed schema |
| backend: `npm run database:start` | Workspace fixture ready; loopback-only PostgreSQL |
| backend: `npm run database:migrate:test` | Reviewed foundation migration applied successfully to guarded isolated fixture |
| backend: `NODE_ENV=test` then `npm run test:database` | 1 suite / 4 tests pass using actual PostgreSQL and PrismaService lifecycle |
| mobile: `npm run check` | Lint, strict TypeScript, 6 suites / 31 tests and Android/iOS Hermes bundle exports pass |
| mobile: SDK companion/peer inspection | Expo-selected companions and `npm ls --all` agree; no invalid/missing peer graph reported |
| backend/mobile: `npm audit --omit=dev --json` | Findings remain; see security review below. Audit is not reported as passing |

Total: 103 passing tests. The mobile exports produced approximately 2.3 MB iOS and 2.7 MB Android bundles. Exports are JavaScript/Hermes build evidence, not signed native builds, real device runs, provider integration or accessibility certification. The Jest VM-module experimental warning is recorded; it did not fail the checks.

Database checks exercise duplicate identity rejection, required session foreign keys, restrictive identity deletion, transaction rollback, one concurrent conditional revocation winner, owner-bound repository revocation and preservation of its first timestamp. Tests delete only records whose UUIDs they created. The guard suite rejects production/missing/remote/wrong-port/wrong-database targets without echoing credentials.

Request tests verify DTO extra-field/type rejection; safe provider/internal failures; replacement of caller-supplied correlation values; no raw secrets in diagnostic captures; 401 versus 403; unannotated denial; public annotation plus inventory; client role rejection; fresh permission decisions; and real wiring with no fixture authenticator/public exception. Crypto fixtures use ephemeral RSA keys and explicit issuer/audience/clock, verifying tampering, algorithm/key rejection, expiry boundaries, required claims and session revocation/binding/unavailability.

Mobile tests use isolated backend outcomes and native substitutes. They verify contract decoding, safe failure mapping, path confinement, cancellation/timeout uncertainty without replay, ordered storage and recovery after failure, feedback accessibility, backend-permitted rendering and suppression of obsolete or failed access results.

## Security and activation review

Configuration and guards deny activation rather than silently selecting remaining policies. No real issuer/audience/key store, clock skew, session-cap handling, inactivity renewal, refresh/replay policy, role grants, provider adapter or onboarding-completion contract is activated. The public production operation inventory is empty. Test controllers and substitutes are never imported by AppModule; inactive methods cannot be enabled with an environment flag. Signatures alone and stored mobile credentials never grant access.

Logger output is limited to timestamp, categorized event/level, generated request ID and status. Raw errors, request URLs/bodies/headers, account/contact identifiers, passwords, hashes, OTPs and credentials are excluded. No retention or audit schedule is invented. Secrets examples contain only nonsecret placeholders; actual local fixture configuration and generated artifacts are ignored.

The schema deliberately omits contacts, profiles, passwords, provider identities, roles, challenge/refresh state and production initialization. Services use explicit session expiry input; the migration contains no guessed lifetime. Current account/onboarding state must be added in its later tasks before these primitives become a real authentication boundary. No new service, queue, Redis/cache or business module was introduced.

### Dependency findings retained as release-remediation gates at IT-003

Audit on the locked candidate reported **backend: 4 high** dependency findings and **mobile: 46 high / 15 moderate** findings. These are dependency nodes, not counts of independently exploitable application flaws. npm includes some optional CLI/test peer dependencies even with `--omit=dev`; local lockfile inspection identifies Prisma CLI dependencies as `devOptional`. Do not treat that distinction as proof of a safe release.

| Finding | Candidate use and review disposition |
| --- | --- |
| [deepmerge-ts <8](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) | Prisma configuration CLI dependency; recursive graphs can exhaust the stack. Repository configuration contains controlled plain values. No application request calls this API. Version 8 is a major change requiring compatibility review. |
| [mysql2 authentication downgrade](https://github.com/advisories/GHSA-3f6p-5ww8-9rcr), [compressed protocol DoS](https://github.com/advisories/GHSA-rgwj-5xj2-c3m3) | Prisma CLI transitive package. This project uses PostgreSQL/Pg only and has no MySQL connection. An upstream-compatible patch resolution should be reviewed; no MySQL service is introduced. |
| [braces stack exhaustion](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | Metro/Jest/tooling graph; installed 3.0.3, advisory lists no patched release. Do not run build tools on untrusted pattern/configuration input. Remaining upstream remediation is tracked rather than waived. |
| [decode-uri-component DoS](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) | Expo Router uses query-string 7.1.3, which requires the CommonJS decoder API. Patched decoder 0.5 changes to ESM; a blind override would break callers. Deep-link query parsing is potentially reachable mobile behavior. A compatible upstream update or reviewed remediation is required before release; title-screen tests do not resolve it. |
| [node-forge signature verification](https://github.com/advisories/GHSA-86w9-cpqp-85rv) | Expo code-signing/CLI tree, not the Nest access verifier. Advisory lists no patched release for installed 1.4.0. No application update signing/provider validation is implemented. Retain the build/signing review gate. |
| [sprintf-js precision DoS](https://github.com/advisories/GHSA-hp3w-g68c-fv3c) | Transitive tooling/test graph; no application formatting API exposed. An upstream fix/disposition remains necessary. |
| [uuid bounds checks](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | xcode tooling dependency. Application identity uses PostgreSQL/library UUID generation; it does not call affected buffer-based UUID methods. A version override would cross the dependency's major line and needs review. |

Reachability assessments above are based on repository imports, installed package consumers and enabled foundation behavior. They are bounded review findings, not production penetration-test results. Automatic audit suggestions include downgrading Expo to 44 or Prisma to 6, conflicting with the approved stack. No forced downgrade, unreviewed fork, manual dependency edit or cryptographic workaround was applied. The owner accepted IT-003 with the listed release-remediation gates retained; no finding is marked fixed and no production release is approved by this disposition.

## Dependencies before the next task

**IT-003 is closed:** the accountable owner selected “Accept foundation exit; retain listed release-remediation gates” after reviewing this candidate. The supplied checks/reviews and attributable acceptance satisfy the foundation exit in [tasks.md Section 4.1](../tasks.md). Release findings remain assigned to the later candidate/security review.

**DEV-010 is active:** the owner removed the age restriction and approved email expiry from issuance, immediate resend supersession, and latest-only/single-use acceptance. Five-minute email expiry, 30-second resend, verified replacement contacts and approved OTP limits remain. [Account readiness proposal R2](account-readiness.md) consolidates remaining provider OTP expiry/recovery, registration abuse/privacy and technical reviews. Actual Twilio/Resend credentials/service/domain/sender configuration belong to the corresponding activation/integration gates and must be supplied securely, never in chat/source.

Later tasks retain method/provider/signing/device matrices, remaining session/key/refresh contracts, Argon2id deployment calibration, privileged action/provisioning rules and measurement requirements. They are enumerated in execution-register.md and approved-policies.md. No later story is implemented to bypass the current phase exit.

## Traceability template for subsequent results

| Candidate hash / revision | Task | Requirement / VAL | Approved configuration | Controlled starting data | Command / procedure | Platform / build | Actual outcome | Evidence / reviewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Fill from candidate inventory | DEV-/IT- | Source IDs | Policy/provider/config references, no secrets | Fixture IDs and explicit clock | Reproducible command | Exact OS/device/build | Pass/fail/blocked; no silent skip | Test/report path and attributable review |
