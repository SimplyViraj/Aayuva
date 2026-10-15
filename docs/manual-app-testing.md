# Manual registration test on iPhone — DEV-017 / IT-005 / IT-006

The owner requested manual testing from the app and selected iPhone with Expo Go. This independent launcher reuses the implemented registration, phone and email screens. Its paired Nest test API uses the guarded local PostgreSQL fixture and actual configured providers, with fixed owned test destinations and an isolated primary-identity substitution. This validates DEL-002; it does not implement DEL-003 sign-in.

## Start on the desktop

Keep the desktop and iPhone on the same Wi-Fi/hotspot network. The inspected Wi-Fi address was `172.20.10.4`; use the current Wi-Fi address shown by the server if it changes. Do not use the WSL adapter address. Leave both terminals running.

In a terminal opened in **backend**:

```powershell
npm run database:start
npm run providers:preflight
npm run providers:app
```

Keep Docker Desktop running and wait for `Isolated PostgreSQL ready` before continuing. If the helper reports that the database is starting, rerun it. Preflight checks settings and fixture connectivity without sending a message.

It prints API URLs and a private pairing key once in the local terminal. Keep the key out of chat, screenshots and captured logs. The server expires after 30 minutes; starting it does not send messages.

In another terminal opened in **mobile**:

```powershell
$env:REACT_NATIVE_PACKAGER_HOSTNAME = '172.20.10.4'
npm run manual:start
```

Scan its Expo QR with the iPhone Camera and open in Expo Go. This starts **AAyuva Registration Test** on port 8083. The ordinary `npm start` still opens the normal Router app. No second dependency installation or upgrade is needed; the separate launcher resolves the parent's installed approved packages. Expo Go must support SDK 57. If it reports a mismatch, share only version/error text for review. [Expo compatibility guidance](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/).

If local access is denied, allow Expo Go's local-network permission and check the desktop private-network firewall access for ports 3001/8083. This is a paired local test, not deployment.

## Exercise the screens

1. Enter `http://172.20.10.4:3001` (or current Wi-Fi API URL) and the private pairing key in the app. Tap **Connect test app**, then **Start test registration**. The pending fixture grants no ordinary access.
2. Save the required name. On **Verify phone**, enter the same owned India number configured as TEST_PHONE_NUMBER, request the SMS and check the received code in the app. The server refuses other destinations.
3. On **Verify email**, send the email. Copy its latest verification link from Mail, return to the app and tap **Paste received email link**. Paste into the hidden field, tap **Use received link**, then **Verify email**. This supports Expo Go without claiming the production `aayuva://` native callback was tested.
4. Return to account setup and complete after backend status reports the required name/verified contacts. This creates a fixture MEMBER and no session. Re-registering that completed identity should conflict; real normal sign-in remains DEL-003.
5. Stop both terminals with Ctrl+C. API shutdown revokes only its own active contexts/email proofs. It retains unresolved phone references/rate windows for safe expiry and completed fixture members for inspection. It resets no production database or unrelated fixture.

Keep codes, links and pairing keys out of chat. Report only success/error text and platform/build. Record required verification/completion, name boundaries, wrong-code refusal, resend waits, latest-only/single-use email proofs, interrupted/reopened state, text scaling, keyboard reachability and VoiceOver labels. Approved budgets remain enforced; failed/indeterminate attempts count.

## Implementation and evidence

The manual Nest entry is absent from AppModule, ignores production DATABASE_URL and requires the guarded fixture. Every operation requires the ephemeral pairing key; a fixed owned email supplies primary fixture evidence. Provider wrappers restrict destinations before delivery. Production flags/authenticators/controller wiring are unchanged. The separate Expo entry requires development mode, uses a distinct serialized native SecureStore key and keeps pairing/email proofs transient. Ports 3001/8083 and its 25-second deadline are local-test settings. [Expo custom entry documentation](https://docs.expo.dev/versions/latest/sdk/expo/#registerrootcomponentcomponent).

Backend `npm run test:manual` passes paired access, client-role refusal, destination restriction and fixture completion using substitute providers and actual isolated PostgreSQL. Mobile pairing/proof tests pass. Backend/mobile checks, ordinary Android/iOS exports and the separate iOS export pass. The development manifest probe returned HTTP 200 with the correct name and bundle advertisement. No previous terminal rehearsal process was running; its cancelled challenge had passed local/provider recovery expiry, permitting a fresh bound request.

Actual device/provider observations are not yet recorded. IT-005/IT-006 and owner exit IT-007 remain open; DEV-018 remains gated. Production deep linking, real primary sign-in and the complete device/accessibility matrix need separate evidence.

## Email setup without a custom domain — 2026-10-15

For local self-testing, `REGISTRATION_EMAIL_SENDER=onboarding@resend.dev` uses Resend's official test sender. `TEST_EMAIL_ADDRESS` must be the inbox used to sign up for that Resend account. A personal mailbox belongs in the recipient setting, not the From setting: Resend requires ownership/verification of a custom sender domain for broader delivery. Keep the API key send-only. [Resend quickstart](https://resend.com/docs/send-with-nodejs), [recipient/domain restrictions](https://resend.com/docs/api-reference/errors).

Environment settings are read when the API starts. After changing a sender/key/inbox, stop `providers:app` with Ctrl+C and start it again. Reload the test app, reconnect with the newly printed pairing key and start fresh setup if the old pending context was revoked/expired. Request a fresh email and use its latest link within five minutes. Restarting does not clear approved rate windows; rejected/indeterminate attempts still count.

On 2026-10-15 the owner reported the app's safe unavailable message. Inspection found a public-mailbox sender and an unreachable fixture because Docker was stopped. The existing database was restored and only the private local From setting changed to the test sender; preflight passes. The latest attempt was indeterminate and granted no verification. Actual successful delivery still needs the owner's app retry with the correct account inbox.

## Email failure diagnostics and resend wait ? 2026-10-15

The configured recipient matches the account inbox supplied by the owner. The reported 503 at 04:19:25 UTC followed email issuance at 04:19:24; the 429 at 04:19:32 occurred inside the approved 30-second resend wait. Inspection found three of five hourly requests used, so that observed 429 was not the hourly destination limit. No rate records were cleared.

The email screen now queries status once after failed delivery and displays the server resend wait while preserving the original error. It never retries delivery automatically. Restart the backend manual server with `npm run providers:app`, reload the Expo app, reconnect with the new local pairing key and request an email when the wait has elapsed. Backend restart revokes its old active pending contexts; start fresh setup if needed.

For a rejected delivery, the manual server prints `manual_email_delivery_failure` with only HTTP status and a fixed reason: `test_recipient_restricted`, `sender_domain_unverified`, `api_key_rejected`, `provider_rate_limited`, `provider_rejected`, or `transport_unavailable`. Share only that diagnostic line if delivery still fails. It excludes provider bodies, inboxes, links, codes and keys. These diagnostics exist only in the separate test server; normal API error responses remain sanitized. A generic 503 without this line can also arise outside the outbound request and needs separate investigation. No successful delivery is claimed.

## Registration start cannot reach the API ? 2026-10-15

If Start test registration fails without a new backend error log, check reachability before email/provider settings. The Connect test app button validates local connection fields; it does not itself make a request. The computer probe returned HTTP 401 at http://172.20.10.4:3001/registration with no pairing key, confirming the running API answers on that Wi-Fi address. Open that URL in iPhone Safari: an unauthorized JSON response demonstrates phone-to-API HTTP reachability; a load failure indicates the network path still needs attention. Enter only http://172.20.10.4:3001 as the app base URL, with no /registration suffix, localhost or Expo port. Keep both devices on the same network and enable Expo Go local-network permission.

The app now distinguishes a fetch failure without an HTTP response from an actual backend 503, and Change test connection returns to the URL/key fields without automatically replaying registration. Pairing keys remain transient. The observed Windows Wi-Fi profile was Public; detailed firewall inspection was denied by Windows. No firewall/network-profile setting was changed. If Safari cannot load, review a narrowly scoped inbound TCP 3001 rule for the test network; a working Expo QR/Metro connection alone does not prove port 3001 is reachable. The guarded database/schema/settings preflight passed without messages or writes. The Supabase DATABASE_URL in backend/.env is not used by this manual server.

The later 05:15:56 UTC failure was confirmed as Send verification email: registration creation succeeded, followed by indeterminate email delivery. A generic http_error/status 503 does not identify the provider reason. For this case, collect the separate manual_email_delivery_failure line from a fresh owner-driven email attempt. Keep pairing keys and all other environment values out of the report.

The owner has now captured HTTP 403 / test_recipient_restricted. In the Resend dashboard for the key's account/team, inspect the failed email API response privately to identify the allowed test inbox. Set TEST_EMAIL_ADDRESS to that exact inbox, or use a sending key belonging to the intended matching account. Keep REGISTRATION_EMAIL_SENDER=onboarding@resend.dev. Restart providers:app, reconnect using the new pairing key and begin fresh setup if the prior pending credential was revoked. This restriction is documented at https://resend.com/docs/knowledge-base/403-error-resend-dev-domain. No custom domain is needed for the permitted self-test inbox; broader recipient delivery requires a verified sending domain. Never paste the API key or response containing personal data into chat.
