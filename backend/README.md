# AAyuva backend

DEV-003–DEV-009 foundation: NestJS modular monolith with TypeScript, shared request safeguards and PostgreSQL persistence. No registration, sign-in or business endpoint is exposed yet.

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

DEV-004 rejects every authentication activation flag until the relevant workflow/policy/provider tasks are implemented. DEV-005 installs global DTO allowlist validation, a safe error envelope and server-generated X-Request-Id correlation. Logs contain only timestamp, categorized event/level, generated request ID and HTTP status; no bodies, URLs, caller headers or raw exceptions. Retention/audit policy is not selected. To inspect the empty foundation OpenAPI and error model locally, set API_DOCS_ENABLED=true in development/test and open /docs. Documentation activation is rejected in staging/production.

Services should use reviewed HttpException statuses and deliberate response DTOs. Exception strings never become API errors or logs. Domain-specific safe error contracts belong to their feature tasks. Thin controllers must declare validated DTOs; resource services must enforce ownership/business rules. No test fixture controller is imported by the application.

The approved NodeNext/CommonJS configuration consumes Nest 12 ESM through Node’s native support. Jest runs with VM-module support for the Prisma ESM adapter and maps generated local `.js` imports to TypeScript sources. Generated Prisma code must be regenerated, never edited. Unit tests require no database/provider connection; database cases have a separate command and never silently skip a missing fixture.

Global guards authenticate before authorizing. The current public-operation inventory is empty. New public operations require both a reviewed inventory entry and `PublicOperation`; authenticated operations require `RequireAction` and a backend policy. Absence of a policy denies access. `requestPrincipal` returns only the server-established identity; never use client roles or owner IDs as authority. Resource services compare the stored owner and recheck mutation-relevant state at the write boundary.

The signature verifier accepts only explicitly configured trusted RS256 keys, issuer/audience, required access purpose, UUID subject/session and a maximum 15-minute lifetime. `SessionAuthenticator` rechecks bound, unexpired, unrevoked database state on every request. The application intentionally wires an inactive authenticator and a denying policy until DEV-018/DEV-023 and DEV-040 supply the remaining reviewed contracts. A bearer token currently yields safe unavailability; there is no environment-controlled fixture bypass. This primitive does not yet establish onboarding completion, current account status or real role grants.

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

The setup prints the workspace-specific container name. To stop the local fixture when unused, run `docker stop <printed-container-name>`; restarting via `database:start` preserves its database. Installed dependencies, generated clients and build output are ignored artifacts. Review [foundation evidence](../docs/foundation-validation.md) and [persistence rationale](../docs/persistence-foundation.md) before phase exit. Actual provider/native-device results and deployment remain later acceptance evidence.
