# AAyuva backend

NestJS modular monolith with TypeScript, shared request safeguards and PostgreSQL persistence. DEV-010–DEV-016 add the prepared account-registration module. AppModule does not import that feature until real primary-identity/provider activation is reviewed, so the starter still exposes no registration, sign-in or business endpoint.

Use Node 24.16.x. From this directory:

```powershell
npm ci
npm run database:generate
Copy-Item .env.example .env
npm run check
npm run build
npm start
```

Set NODE_ENV explicitly through environment configuration. The server listens on validated PORT (local default 3000). For compiler watch mode, run npm run dev alongside a process running the compiled application. Startup/shutdown behavior is covered by the foundation smoke test. Secrets must never be placed in package scripts or committed .env files.

DEV-004 rejects every authentication activation flag until the relevant workflow/policy/provider tasks are implemented. DEV-005 installs global DTO allowlist validation, a safe error envelope and server-generated X-Request-Id correlation. Logs contain only timestamp, categorized event/level, generated request ID and HTTP status; no bodies, URLs, caller headers or raw exceptions. General diagnostic/audit retention is not selected. Set API_DOCS_ENABLED=true in development/test and open /docs to inspect the starter OpenAPI/error model. Registration OpenAPI is verified in the isolated feature API tests. Documentation activation is rejected in staging/production.

Services should use reviewed HttpException statuses and deliberate response DTOs. Exception strings never become API errors or logs. Domain-specific safe error contracts belong to their feature tasks. Thin controllers must declare validated DTOs; resource services must enforce ownership/business rules. No test fixture controller is imported by the application.

The approved NodeNext/CommonJS configuration consumes Nest 12 ESM through Node’s native support. Jest runs with VM-module support for the Prisma ESM adapter and maps generated local `.js` imports to TypeScript sources. Generated Prisma code must be regenerated, never edited. Unit tests require no database/provider connection; database cases have a separate command and never silently skip a missing fixture.

Global guards authenticate before authorizing. The public-operation inventory contains the ten prepared registration operation IDs, each requiring its own primary/onboarding proof; their controller is absent from the starter. New public operations require both an inventory entry and `PublicOperation`; authenticated operations require `RequireAction` and a backend policy. Absence of a policy denies access. `requestPrincipal` returns only the server-established identity; never use client roles or owner IDs as authority. Resource services compare the stored owner and recheck mutation-relevant state at the write boundary.

The signature verifier accepts only explicitly configured trusted RS256 keys, issuer/audience, required access purpose, UUID subject/session and a maximum 15-minute lifetime. `SessionAuthenticator` rechecks bound, unexpired, unrevoked database state and an ACTIVE account on every request. The application intentionally wires an inactive authenticator and a denying policy until DEV-018/DEV-023 and DEV-040 supply the remaining reviewed contracts. A bearer token currently yields safe unavailability; there is no environment-controlled fixture bypass or real role-grant policy.

The prepared `RegistrationModule` provides `/registration` begin/status/cancel, profile, phone send/check/restart, email send/check and completion operations. Begin requires a backend primary-identity verifier; the default verifier always refuses activation. All other operations require an opaque, expiring pending-registration capability, which cannot authorize ordinary member access. Completion requires the trimmed name, verified India phone and verified email for email/password. It creates MEMBER only, refuses canonical collisions, is atomic/idempotent and issues no session. Missing provider profile information is collected during onboarding. No age gate, password, account merge, replacement-contact workflow or recovery feature is added.

Twilio generates/checks SMS codes under approved EXC-001; the application never persists, hashes, returns or logs codes. Resend receives email proofs transiently; only purpose-bound SHA-256 verifiers are stored. Provider calls use fixed hosts, bounded responses and a ten-second deadline. Failed/indeterminate operations never grant access or trigger automatic sensitive replay. Registration email resends invalidate older proofs immediately, even if delivery fails. Actual provider service, secrets, owned destinations, sender/domain and callback evidence remain IT-005 prerequisites; the owner deferred that configuration.

Registration configuration names are listed in `.env.example`; populate them only through approved secrets. Direct deployment uses the socket peer for shared PostgreSQL rate controls and ignores forwarded headers. Proxied topology requires reviewed trusted CIDRs before activation. HMAC key rotation must preserve active abuse windows. `RegistrationMaintenance.purge()` is a backend operational entry point with no HTTP route: deploy and monitor an at-least-hourly invocation before activation so approved retention maxima are met. It does not delete stable members or sessions. Production history/initialization, caller verifier, API deadline, topology and operational scheduling remain explicit deployment gates.

For the isolated PostgreSQL checks, start Docker and run:

```powershell
npm run database:start
# Rerun database:start if PostgreSQL is still starting.
npm run database:generate
npm run database:migrate:test
$env:NODE_ENV = 'test'
npm run test:database
```

The helper uses PostgreSQL 18.6 on `127.0.0.1:54329`, database `aayuva_test`, with random credentials in git-ignored `.env.database.local`. Never commit, print or reuse those credentials in deployment. The migration wrapper ignores ambient `DATABASE_URL` and targets only that guarded fixture. Tests clean up only their own UUID records. Nothing resets/deletes a database. `database:migrate` is the general deployment command and requires separately approved target/configuration; it is not the test shortcut. `DatabaseModule` connects when a reviewed consumer imports it; the starter has no database-dependent routes.

The database test configuration allows 30 seconds per fixture case/hook for Windows/PostgreSQL setup and cleanup; this is not a production latency target. Primary-identity substitutions live only in isolated tests/rehearsals, never AppModule; provider substitutes remain in automated tests.

For IT-005, add `TEST_PHONE_NUMBER` (an India number you own) and `TEST_EMAIL_ADDRESS` (an inbox you control) to private `backend/.env`. A Resend send-only key is sufficient for delivery: its `restricted_api_key` HTTP 401 on domain-list operations does not imply an invalid sending credential. Confirm the configured sender domain in the Resend console instead of broadening application key access. [Resend error reference](https://resend.com/docs/api-reference/errors).

After generating/building the client/application and preparing the isolated database above, run:

```powershell
npm run providers:preflight
npm run providers:rehearse
```

Preflight validates settings, destination formats and the guarded fixture schema, without messages or writes. Rehearsal requires a real local terminal and a literal `SEND` entry confirming ownership/permission for one SMS and one registration email. Enter the received SMS code and paste the latest received email verification link only at its hidden terminal prompts. Never put codes/proofs in `.env`, command arguments, files or chat. Share only the safe PASS/FAIL/cleanup lines; do not record the terminal input.

The rehearsal calls the actual registration services with a clearly isolated primary-identity fixture. It ignores ambient/production `DATABASE_URL`, never starts a public server, and creates no member/session. Actual outbound budgets are retained across runs. Cleanup cancels the bound remote phone verification and the local context, removing only its own context after reconciliation; uncertain bindings remain for safe expiry/maintenance. This command covers the real-provider happy path, not the full IT-005 resend/expiry/fault matrix, native-device acceptance or DEL-002 exit. `npm run test:rehearsal` checks private-input and proof-extraction safety without providers or a database.

For the owner-requested app test, run `npm run providers:app` in a real local terminal. It starts a paired test API on port 3001, expires after 30 minutes, restricts messages to owned destinations and uses only the guarded fixture. Its pairing key is intended local credential issuance; never capture/share that line. `npm run test:manual` checks access/destination boundaries with provider substitutes and isolated PostgreSQL. Follow the [iPhone guide](../docs/manual-app-testing.md). This entry is absent from AppModule and does not activate normal authentication.

The setup prints the workspace-specific container name. To stop the local fixture when unused, run `docker stop <printed-container-name>`; restarting via `database:start` preserves its database. Installed dependencies, generated clients and build output are ignored artifacts. Review [account validation](../docs/account-validation.md), [account schema review](../docs/account-persistence.md) and [current inventory](../docs/account-files.md). Historical [foundation evidence](../docs/foundation-validation.md) retains accepted release-remediation gates. Actual provider/native-device results are required before IT-007; deployment is not approved.
