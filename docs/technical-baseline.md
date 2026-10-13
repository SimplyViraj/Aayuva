# DEV-002 technical compatibility review preparation

Prepared on 2026-10-13, Asia/Calcutta. DEV-001 is complete. The owner subsequently stated, "all revisions are approved." This approves the presented R1 technical baseline and workspace installation/scaffolding. DEV-002 is complete; DEV-003 through DEV-009 are implemented and verified within foundation scope; see foundation-validation.md. The separate Argon2id candidate and password-counting semantics were approved for later calibration. This is not an installed dependency record or a claim of passing builds. See [execution-register.md](execution-register.md) and [approved-policies.md](approved-policies.md) for current authority and gates.

## Proposed tooling baseline

The following stable package metadata was checked against the npm registry and primary documentation. Exact transitive versions and peer compatibility must be verified by installation and captured in lockfiles during DEV-003. Do not use mutable `latest` tags to create the eventual baseline: Prisma’s current `latest` resolved to a release candidate in this check.

| Component | Proposed selection / verified record | Compatibility and verification remaining |
| --- | --- | --- |
| Runtime | Node.js 24 LTS; local `24.16.0`; npm `11.13.0` | Meets documented Expo SDK 57, Nest 12 and Prisma 7 floors; record supported Node range in manifests and CI |
| Mobile | `expo@57.0.28`, SDK 57 | Expo documentation pairs SDK 57 with React Native 0.86 and React 19.2.3; use the SDK’s package resolver for exact compatible patches |
| Navigation | Expo Router, SDK-compatible 57 line; documentation recommends `~57.0.26` | Preserves supplied `mobile/app/` route notation; install required SDK companions with `expo install`; no direct external React Navigation imports in application code |
| Mobile secure storage | Expo SecureStore, SDK-compatible 57 line; documentation recommends `~57.0.4` | Centralize storage operations; handle native errors and platform lifecycle. Do not infer backend validity from stored credentials. No biometric sign-in feature is selected. |
| Backend | `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` aligned to `12.1.3` | TypeScript modular monolith, REST, dependency injection; ESM package consumption and compiler configuration must be verified before task acceptance |
| Backend configuration | `@nestjs/config@12.0.1` | Published peers include Nest common 11/12 and RxJS 7; policy activation still requires approved settings |
| OpenAPI | `@nestjs/swagger@12.0.2` | Published peers require Nest 12; support TypeScript 5.5 or 6, class-validator and reflect-metadata |
| Persistence | Explicit stable `prisma@7.10.0`, matched `@prisma/client` and `@prisma/adapter-pg` | Adapter-pg 7.10.0 availability verified; use PostgreSQL and Prisma Migrate. Verify matched client, generator/configuration and generated imports when installing. Do not select `8.0.0-rc.22` merely because it is tagged latest. |
| Backend tests | `jest@30.5.2`, `ts-jest@29.4.14`, `supertest@7.3.1` | ts-jest’s published peers support Jest 30 and TypeScript <7. Jest documents Node 24.9+ native require(ESM) compatibility. Verify Nest integration and isolated database setup before accepting the foundation. |
| Mobile tests | `jest-expo@57.0.6`; `@testing-library/react-native@14.1.0` | RNTL published peers require React >=19, RN >=0.78, Jest >=29 and `test-renderer ^1.0.0`; jest-expo peers include RN Jest preset `^0.86.3`. Resolve exact React/RN/Jest/rendering peers together and verify behavior tests. |
| Mobile Jest runtime | `jest@29.7.0` with SDK-aligned jest-expo | Separate package boundary permits the Expo preset’s Jest 29 dependencies without forcing backend Jest 30 onto mobile. Validate the RN preset/RNTL renderer peer together. |
| TypeScript, validation and lint | `typescript@6.0.3`; `class-validator@0.15.1`; `class-transformer@0.5.1`; `eslint@9.39.5`; `typescript-eslint@8.71.2` | The verified TypeScript ESLint peer range is >=4.8.4 and <6.1.0; TypeScript 7.0.2 currently tagged latest is intentionally excluded. Strict typing and DTO allowlists remain required. |
| PostgreSQL | PostgreSQL 18.6, disposable local/test instance | Official version table lists this as the current supported 18 minor. An isolated Docker instance is now available; migration/constraint/concurrency results are recorded in foundation-validation.md. |

Registry checks were read-only `npm view` queries for package versions, engines, peer dependencies and dist tags. No global package update, installation, provider account setup or database mutation was performed. Exact SDK companion patches, RxJS/reflect-metadata/pg, type packages and lint plugins will be resolved against these approved major lines and captured in lockfiles; a peer conflict requiring a different baseline will return for review. Metadata compatibility is preliminary; native and executable compatibility require the checks below.

Backend compiler proposal: NodeNext module/resolution settings with CommonJS output, decorator metadata and strict typing, on Node >=24.16.0. Nest 12 ESM packages are consumed through supported native require(ESM). Jest 30 is selected for the same runtime behavior; ts-jest transforms project TypeScript rather than rewriting dependency ESM. Verify this combination in DEV-003 before accepting it. Mobile uses Expo’s Babel/Metro configuration and TypeScript base with strict checks.

## Folder placement proposed for review

Keep the source documents at the root. Create separate `mobile/` and `backend/` package boundaries only in DEV-003, with their own manifests, TypeScript/check configuration and lockfiles. Avoid introducing a monorepo orchestration dependency without need.

- Mobile entry/routes remain in `mobile/app/`; shared API/configuration/storage in `mobile/src/lib/`; authentication behavior in `mobile/src/features/auth/`; provider integration in `mobile/src/providers/`.
- Backend bootstrap/configuration/common behavior remain under `backend/src/`; domain modules under `backend/src/modules/`; persistence under `backend/src/database/` and `backend/prisma/`.
- Choose `backend/src/modules/sessions/` for session responsibilities, matching the supplied task placement. Auth orchestration depends on this module through NestJS injection. This reconciles plan Section 4.1’s initial auth-local placement without changing identity/session trust boundaries or introducing another service.
- Keep auth and authorization checks separate. No public production authentication fixture, arbitrary role grant, business resource module, dashboard or empty future-task folder is needed to demonstrate the foundation.

These are proposed technical selections within the mandated stack. They do not decide profile/contact rules, token lifetimes, refresh race policy or production permissions.

## Build and platform allocation

| Validation | Tool/build allocation | Outstanding prerequisite |
| --- | --- | --- |
| Compatible JavaScript/mobile foundation | Expo Go on Android and iOS; SDK-compatible Router and SecureStore | Verify installed Expo Go supports the selected SDK and collect actual run evidence; availability is not inferred from package metadata |
| Google OAuth and custom redirect/native flows | EAS development build on physical iPhone; corresponding Android development build | Expo/EAS account, reviewed app identifiers and schemes, provider client IDs/audiences/redirects, signing credentials and trusted configuration |
| Native Apple authentication | iOS development build with correct capability | Apple developer/signing/provider setup; backend verifier configuration; separate cancellation/private-relay evidence |
| Android platform evidence | Windows Android emulator or representative physical device | SDK/emulator/device readiness and approved representative matrix; iPhone results cannot substitute |
| iOS native build | EAS cloud build given Windows/no Mac context | Account/signing readiness and explicit review before external build/upload; no local iOS-build claim |
| Required mobile checks | Lint, TypeScript, Jest/RNTL, Expo package compatibility and Android/iOS JS bundle/export | Install and lock reviewed dependencies; distinguish bundle export from native build/device acceptance |
| Backend checks | Lint, TypeScript, Jest/Supertest and backend build | Installed/locked packages, reviewed config and isolated PostgreSQL where required |

SDK 57 documentation lists Android 7+ and iOS 16.4+ as framework minimums. These are compatibility constraints, not approved AAYUVYA supported OS versions. Product approval of DEC-015 must be checked against them; choose another compatible stable SDK if the approved iOS matrix requires an earlier OS. Representative OS/devices, screen sizes, text scaling, screen-reader/focus/contrast/touch criteria and keyboard/navigation cases remain open under CLR-020.

SecureStore uses different native stores on Android and iOS, with different uninstall/backup behavior. Foundation tests can use isolated responses, but DEV-018/IT-018-style real lifecycle evidence cannot be replaced by mocks. Expo documents development builds for OAuth/custom scheme flows; Expo Go does not establish that validation.

## Primary sources checked

All links below were consulted on 2026-10-13. The descriptions summarize compatibility findings and do not adopt tutorial policy defaults.

- [Expo SDK reference](https://docs.expo.dev/versions/latest/) — SDK/React Native/React/Node and platform compatibility table.
- [Expo Router installation](https://docs.expo.dev/router/installation/) and [SDK 57 Router reference](https://docs.expo.dev/versions/v57.0.0/sdk/router/) — entry point, compatible companion installation, route placement and current import constraints.
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) — supported platforms, SDK package version and native storage/error/lifecycle behavior.
- [Expo authentication guide](https://docs.expo.dev/guides/authentication/) — OAuth and development-build constraints.
- [Expo Jest guidance](https://docs.expo.dev/develop/unit-testing/) — SDK-aligned Jest testing integration; verify package peers rather than copy older renderer examples.
- [Nest migration/runtime guide](https://docs.nestjs.com/migration-guide) — Nest 12 ESM, runtime/compiler/CLI constraints. Installed Node 24.16.0 exceeds the documented Node 24.15 CLI floor.
- [Prisma system requirements](https://docs.prisma.io/docs/orm/v6/reference/system-requirements), [generator reference](https://www.prisma.io/docs/orm/v6/prisma-schema/overview/generators) and [Prisma 7 connections](https://docs.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections) — supported runtime context, generated-client evolution and driver-adapter connection configuration. Prisma 7 choices must use its own schema/configuration rules; v6 examples are not a v7 setup recipe.
- [npm registry Expo metadata](https://registry.npmjs.org/expo/57.0.28), [Nest core metadata](https://registry.npmjs.org/@nestjs%2fcore/12.1.3), [Prisma metadata](https://registry.npmjs.org/prisma/7.10.0), [jest-expo metadata](https://registry.npmjs.org/jest-expo/57.0.6) and [RNTL metadata](https://registry.npmjs.org/@testing-library%2freact-native/14.1.0) — published version/engine/peer evidence checked using npm.

## Acceptance and next action

DEV-001 is complete. The owner reviewed R1 and requested revision before implementation. The later owner direction, "all revisions are approved," approves the presented choices and supersedes the earlier revision request. Workspace dependency installation/scaffolding is authorized. Native builds, actual provider accounts/credentials, feature policies and device evidence remain separately gated. Installation/check results and exact lockfiles must be recorded during DEV-003; no passing build is claimed at the review step.

## Proposal R1 presented for owner review

1. Separate `mobile/` and `backend/` packages, Expo Router routes under `mobile/app/`, and a dedicated NestJS `sessions` module. Preserve the mandated React Native/TypeScript, NestJS/TypeScript, REST/JWT, PostgreSQL/Prisma and Jest stack.
2. Node 24.16+, Expo SDK 57.0.28 with compatible React Native 0.86/React 19.2.3 companions, Router and SecureStore; Nest 12.1.3; Prisma 7.10.0 and PostgreSQL 18.6. Use the exact compiler/test/lint selections above and lock SDK-compatible companion patches after resolution.
3. Initially validate compatible work in Expo Go; use required EAS development builds for native/OAuth flows. SDK 57’s iOS 16.4+ floor is a technical constraint for review, not a silent approval of the product’s entire support/device matrix.
4. Keep production authentication methods unavailable until approved policy and provider configuration exist. Foundation guard tests may use test-only injectable substitutes; no production fixture or guessed session/rate policy is introduced.
5. For later DEV-019/DEV-037 review, propose `argon2@0.45.1`, Argon2id, memory 65,536 KiB, 3 passes, parallelism 1, 32-byte hash and library-generated random salt. This is a calibration starting point, not a benchmarked deployment choice. Measure latency/memory at the agreed deployment concurrency before credential activation. Propose counting Unicode code points without trimming or normalizing passwords; name bounds use code points after exterior trimming. These counting semantics also need owner approval.

R1 foundation choices and the presented counting semantics are approved by the later owner response, “all revisions are approved,” on 2026-10-13, superseding the earlier request to revise. The Argon2id candidate still requires deployment calibration. DEV-002 is complete; DEV-003 creates and validates the minimum application foundations. Remaining feature policies, provider/device evidence and phase exits are separate gates.

Additional primary evidence checked for R1: [Jest ESM/runtime behavior](https://jestjs.io/docs/ecmascript-modules), [PostgreSQL versioning/support](https://www.postgresql.org/support/versioning/), [node-argon2 implementation/options](https://github.com/ranisalt/node-argon2/wiki/Options), and published npm metadata for ts-jest 29.4.14, TypeScript 6.0.3, Jest 30.5.2/29.7.0, TypeScript ESLint 8.71.2, ESLint 9.39.5 and argon2 0.45.1. Choices above are the technical proposal; documentation examples do not approve product limits.

## Installed compatibility resolution and evidence

The approved baseline was installed and locked. SDK-selected companions include React DOM 19.2.3, Reanimated 4.5.1, Worklets 0.10.1 and test-renderer 1.2.0, avoiding incompatible newer peer selections. Pg 8.23.1 supplies the Prisma PostgreSQL adapter; dotenv 18.0.3 supports CLI/test-only environment loading. Nest JWT 12.0.3 supplies the maintained verification primitive within the approved Nest/JWT stack; it creates no production issuance route or signing configuration.

Backend compilation, lint, type checks and tests pass. Prisma adapter tests need Jest VM-module support and generated-relative-import mapping; generated files remain untouched. Mobile checks and Android/iOS Hermes exports pass with a valid peer graph. See [foundation-validation.md](foundation-validation.md) for exact results, security findings and the accepted IT-003 exit with release-remediation gates retained. Original proposal descriptions above are historical review inputs, not claims that installed packages or device journeys remain unverified.
