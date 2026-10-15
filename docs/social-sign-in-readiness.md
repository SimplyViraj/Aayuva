# Google and Apple sign-in review R3 — 2026-10-15

Status: concrete proposal for owner technical review; not yet approved or implemented.

## Authorization and task scope

The owner reports that the email test now works and requests: “Now do google and apple sign in. Ill add the credentials later.” Record this as owner-reported email success, without assuming that every resend/expiry/device case or registration completion was exercised. IT-005/IT-006/IT-007 remain open.

The new instruction selects Google and Apple as the next methods: DEV-018 preparation, DEV-021, DEV-022 and the minimum shared DEV-023/DEV-024/DEV-025 integration required to make those methods usable. R3-C additionally proposes only the current-session logout portion of DEV-034 so testers can leave a session safely. Password, phone sign-in, account association, refresh/renewal, recovery, privileged provisioning and business features are outside this change. This authorizes preparing the selected methods ahead of the previously documented sequence; it does not fabricate DEL-002 exit approval or waive security requirements. Activation and phase acceptance remain separate from credential-free implementation.

The owner previously instructed “Present technical choices for my review first.” R1/R2 approvals did not cover the new libraries or social-flow/session parameters below. Review R3 before installing these dependencies or implementing the dependent runtime behavior. Credentials can be supplied later through private configuration.

## R3-A: technical packages and placement

Read-only registry inspection and the installed Expo 57 bundled-native-module map established these candidates on 15 October:

| Package | Proposed exact version | Purpose |
| --- | --- | --- |
| Backend `jose` | 6.2.12 | Maintained signature, JWK/JWKS and JWT claim verification for both providers; no custom cryptography |
| Mobile `react-native-nitro-google-signin` | 2.3.0 | Native Google sign-in, Android Credential Manager and iOS Google SDK; nonce-capable, free implementation |
| Mobile `react-native-nitro-modules` | 0.37.1 | Required native peer (Google package requires >=0.36.0); installed RN 0.86.3 satisfies its declared RN >=0.76 requirement |
| Mobile `expo-apple-authentication` | 57.0.2 | Expo SDK 57-aligned native Apple sign-in on iOS |
| Mobile `expo-dev-client` | 57.0.20 | SDK-aligned development-build host for native provider libraries |

Retain Node/Nest/Prisma/PostgreSQL/React/React Native/Expo/TypeScript versions already approved. Resolve and lock transitive dependencies; peer compatibility is preliminary until checks/native builds pass. No Firebase, Supabase Auth, hosted identity platform or provider purchase is introduced.

Keep provider verification/orchestration beneath `backend/src/modules/auth/`, use the existing identity and sessions modules, and put mobile hooks/services/components beneath `mobile/src/features/auth/`. Preserve the separate manual registration launcher. Native imports must be guarded so the existing Expo Go registration test can still start without the Google native module.

Google targets Android and iOS; Apple targets iOS only. Google requires a development build and cannot be validated in Expo Go. Native Apple also requires the correct app capability/identifier for actual app evidence. No EAS upload/build or developer-account action is included in implementation authorization.

## R3-B: provider flow, persistence and abuse proposal

Use native provider ID-token authentication with backend-issued flow binding, not a browser callback or confidential authorization-code exchange. Request basic identity/profile only, with Google offline access disabled. Provider access/refresh tokens and authorization codes are not needed or stored by this selected flow. Apple account-deletion/token-revocation integration is not silently claimed and needs separate release scope before launch.

1. A backend flow-start operation accepts only the allowlisted provider/platform. It issues independent random 256-bit flow capability and nonce values. Persist only purpose-separated capability/nonce verifiers, provider/platform, fixed SIGN_IN purpose, status, timestamps and attempt metadata. These are not phone OTPs.
2. Proposed lifetime: five minutes; maximum five completion submissions per flow. Shared PostgreSQL flow-start budget: 10/IP/minute and 30/IP/hour; completion budget: 20/IP/minute. Reuse the approved HMAC IP-bucket approach and untrusted-forwarded-header policy. These are new proposed limits, not already-approved OTP limits.
3. Supply the nonce through each native SDK using that SDK's documented convention. Validate the returned signed nonce against the stored flow verifier. Apple state must also match the initiating client flow. Do not trust cached Google credentials that lack the fresh nonce.
4. Nest verifies fixed provider issuer/JWKS endpoint, explicit RS256 algorithm, expected server-configured platform audience, signature, required expiry/issued-at/subject and nonce. Where present, Google authorized-party claims must match the configured client binding. Proposed clock allowance: 30 seconds; future/expired evidence outside that allowance is rejected. Audience/issuer/key URLs never come from the submitted token or client body.
5. JWKS retrieval uses fixed HTTPS origins, an explicit ten-second deadline, bounded replies and a five-minute cache with bounded unknown-key refresh. Provider/JWKS uncertainty denies authentication. Retain a previously validated key only within the explicit cache window; no indefinite stale-key fallback.
6. Reserve attempts before provider verification; concurrent verified completion consumes the flow once in a database transaction. Persist no raw ID token, provider credential or plaintext capability. An uncertain/lost completion response requires a fresh sign-in flow; it cannot replay sensitive issuance. Proposed flow metadata cleanup: within 24 hours after expiry/consumption, using the registration maintenance scheduling constraints already documented.
7. Resolve identity solely by verified method/subject. A new identity starts the existing required-name/verified-India-phone onboarding. Populate bounded signed provider name and verified email where available. Apple name supplied separately by the native result is editable profile input, not signed identity evidence. Preserve Apple private-relay identity using its stable subject. Matching contacts never automatically merge accounts; collisions use the existing safe refusal.

Proposed operations: `POST /auth/social/flows` and `POST /auth/social/complete`; completion returns a discriminated onboarding credential or application session response. Define DTO allowlists, no-store, explicit operation inventory and OpenAPI before wiring routes. Incomplete configuration returns a safe unavailable state and never starts a fake/provider-bypass session. A controller test fixture remains confined to tests.

## R3-C: minimum shared initial-session proposal

Complete sign-in for existing members needs DEV-023 session issuance; provider token verification alone cannot grant application access. Reuse the existing session store, JWT verifier and account-completion rules.

- Retain the approved RS256 access JWT lifetime of 15 minutes. Require explicit deployment issuer, audience, key ID and a server-only RSA private key of at least 2048 bits; derive/validate the public key. Require these settings for activation, with no production defaults or generated production key committed to the project. Proposed access-token clock allowance: 30 seconds.
- Create one stored session for the backend-established ACTIVE member and bind its UUID into the application access token. Apply the approved five-session cap atomically by locking that user's issuance. Proposed cap outcome: refuse the sixth live session, without evicting another device. This choice needs owner approval.
- Proposed temporary access-only boundary: each newly issued session expires with its 15-minute access token, because no renewal credential exists in this selected slice. Expired/revoked sessions do not count against the cap. This explicitly proposed shorter initial-session lifetime must be approved in R3; do not silently treat a nonrenewable, expired credential as one of five live sessions for 30 days. The previously approved 30-day inactivity policy remains a requirement for DEL-005 persistent sessions and is not claimed as implemented here.
- This change proposes initial access, an authenticated own-context endpoint and current-session logout. Logout revokes only the authenticated stored session; local credential clearing alone cannot acknowledge server revocation. This is a specifically reviewed small dependency from DEV-034, without treating that whole task/phase as complete. No refresh credential/endpoint, automatic renewal, logout-all or recovery behavior is included. Until DEL-005 renewal is implemented, access expiry requires a fresh provider sign-in; do not claim persistent launch restoration. Review logout/expiry and cap recovery together; never silently evict a different device.
- Mobile renders only backend-confirmed onboarding/current context. No business dashboard or role-based business grant is included. Provider success, token presence or decoded client claims do not establish protected access.

R3-C is a proposed temporary implementation boundary for initial sign-in, not acceptance of the full persistent-session story. If the owner requires continuity now, the required DEL-005 tasks and unresolved rotation/race policies need separate selection/review rather than a hidden implementation expansion.

## Credential and activation checklist (deferred at owner's request)

Use `.env.example` placeholders and conditional Expo app configuration; do not edit private `.env` values during this proposal.

- Google: backend web audience and approved native iOS/Android client bindings; matching public mobile client IDs, iOS URL scheme, bundle/package IDs and signing-certificate fingerprints.
- Apple: approved iOS bundle ID/audience, Sign in with Apple entitlement and signing/developer configuration. A web Services ID/client secret is not required by the proposed native ID-token verification-only flow; review separately if code exchange or revocation is added.
- Application backend: explicit JWT issuer/audience/key ID/private key, reviewed HTTPS API URL and the existing abuse HMAC settings. Public client IDs may enter mobile build configuration; confidential provider/application keys must remain server-side.
- Enable either method only when its backend/mobile/native configuration is complete. Missing credentials leave the option unavailable; they never enable a fixture in the ordinary app.
- Supply provider/native configuration and request real Google Android/iOS and Apple iOS tests later. Do not claim native compatibility from an Expo JavaScript export.

## Tests, review and modified-file boundary

Use synthetic RSA-signed tokens and isolated JWKS responses to test valid evidence, wrong signature/issuer/audience/algorithm/nonce/provider/purpose, missing/expired/future claims, unknown-key rotation, bounded outages, verified-email handling and Apple relay/missing-profile behavior. Use the guarded PostgreSQL fixture for replay/concurrency, canonical collisions, onboarding versus existing identity and session-cap issuance. Tests send no real messages and use no actual provider identity.

RNTL covers method availability, platform gating, user cancellation, missing evidence/configuration, transient token handling, safe failures, single submission and backend-driven navigation. Run affected lint/strict TypeScript/Jest/build checks. Review migration constraints/indexes, data minimization and log canaries before runtime activation. IT-009/IT-010 real credentials, signing and device evidence remain explicit dependencies.

Candidate files: provider/flow/session source, DTO/controller/module and tests beneath the existing backend modules; a scoped Prisma schema/migration and guarded integration tests if R3-B/C is approved; mobile auth adapters/API/hooks/components, entry/provider configuration and tests; package manifests/lockfiles, public environment examples and necessary app config; task/approval/validation/file inventories. Do not change constitution.md, specifications.md or plan.md. Exact changed paths will be inventoried after implementation.

## Primary technical sources

- [Expo Google authentication](https://docs.expo.dev/guides/google-authentication/) — supported native libraries and development-build requirement.
- [Nitro Google sign-in usage](https://react-native-nitro-google-sign-in.github.io/docs/guide/usage/) — nonce configuration and backend verification.
- [Nitro Google installation](https://react-native-nitro-google-sign-in.github.io/docs/getting-started/installation/) — native peer requirements.
- [Expo Apple authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/) — nonce/state, iOS capability, cancellation and first-authorization-only profile fields.
- [Google backend verification](https://developers.google.com/identity/sign-in/ios/backend-auth) — signature/issuer/audience/expiry and stable subject; third-party email caveats apply.
- [Apple user verification](https://developer.apple.com/documentation/signinwithapple/verifying-a-user) — provider evidence verification.
- [jose](https://github.com/panva/jose) — maintained JWT/JWKS implementation.

Owner disposition: pending. No package installation, implementation, migration, provider credential change, live provider call, native build/upload or production activation has occurred for R3.

Actual pre-review changes are documentation only: this new proposal, docs/account-validation.md (owner-reported email success), docs/approved-policies.md (selected methods and review boundary), docs/execution-register.md (current readiness task), tasks.md (selection/status) and docs/account-files.md (proposal inventory). Application/configuration source fingerprints remain unchanged. No executable checks are rerun for these document-only changes; package metadata and primary-source review are the evidence for this proposal.
