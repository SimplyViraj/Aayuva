# AAyuva mobile

React Native with Expo Router, TypeScript, shared transport/storage and an access-boundary component. DEV-017 adds register/verify-phone/verify-email interactions and backend-confirmed pending-registration restoration. Real primary sign-in and normal authenticated restoration remain DEL-003 and later tasks.

Use Node 24.16.x. From this directory:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

Scan the Expo CLI QR code with a matching Expo Go SDK on a physical device, or use `npm run android` for an available Android emulator. `npm run ios` requires an iOS simulator on macOS; on this Windows workstation, use the physical iPhone/Expo Go for supported work and an approved EAS development build for later native/OAuth flows.

The build command exports Android/iOS JavaScript bundles. This is not a signed native build or evidence that a real provider/device flow passed. SDK 57 requires iOS 16.4+; the full representative product device/accessibility matrix remains a separate gate.

Compatible Router, React, React Native and SDK companion versions are resolved through Expo’s SDK package metadata and locked in package-lock.json. React DOM satisfies the selected Router/React dependency graph; configured build platforms remain Android/iOS. No web product or external React Navigation dependency is added.

DEV-004 provides getMobileEnvironment with explicit public app/API settings; copy .env.example to .env before API integration. Registration also requires an explicit reviewed `EXPO_PUBLIC_API_TIMEOUT_MS`, allowing the backend's ten-second provider deadline plus network overhead. No test value becomes a deployment default. HTTP is permitted only in a development build with an explicit development/test environment. Release builds require HTTPS; credentials, query strings and fragments in the base URL are rejected without echoing their values. The Expo public settings are not secrets.

DEV-005 provides StateNotice for loading, error, empty, success and denied feedback. Supply reviewed user-facing messages rather than raw provider/transport exceptions. The component supports text scaling and an accessible retry action. Real Android/iOS screen-reader, keyboard and lifecycle evidence is still required at the phase/platform gates.

DEV-008 provides `ApiClient`: pass the validated public API base, a reviewed explicit request timeout and a contract decoder for every response. It keeps calls within that base, treats credentials as opaque, maps safe errors, supports cancellation and never automatically retries sensitive operations. Timeout/cancellation can leave the server outcome unknown; future workflow recovery must use its approved contract. Test deadlines are not deployment policy.

`CredentialStore` serializes native SecureStore reads/writes/removal and reports sanitized failures. Its default adapter is real native storage; injectable substitutes occur only in tests. Refresh credentials use `WHEN_UNLOCKED_THIS_DEVICE_ONLY` on iOS. No access decision follows from credential presence. Platform uninstall, backup, device-lock and interrupted storage behavior still need device evidence.

`BackendAccessBoundary` renders protected children only after its supplied backend checker permits access; changed checks and obsolete async completions cannot restore old content. It handles loading, sign-out, denial, failures and explicit retry. It is not wired into a real authentication/restoration journey yet. Future callers must use backend responses, clear obsolete context and supply a stable checker rather than decoding a JWT or trusting provider SDK state.

`RegistrationProvider.begin()` accepts an opaque pending credential issued by the backend after a future trusted primary-sign-in callback. There is no client-supplied identity/role/verified flag or runtime fixture callback. Without that credential the launch screen displays the app name; with it, backend status selects account setup. The current backend starter does not activate registration until its real caller/provider gates are met.

Pending capabilities use the separate `aayuva.registration` SecureStore key with `WHEN_UNLOCKED_THIS_DEVICE_ONLY`; refresh storage remains separate. Each restore confirms status with NestJS. Expiry shown locally and credential presence never grant access. Obsolete responses cannot restore cleared contexts or old form state. Names are trimmed and bounded to 100 Unicode code points. No age/demographic screen is added. Completion requires backend-verified contacts and returns to start for sign-in; it does not navigate to a protected dashboard.

Phone/email requests are explicit, expose backend-derived resend waits and safe error/status recovery, and never automatically replay sensitive submissions. SMS codes and email-link proofs stay in transient component state and are cleared on submission. Email proofs are removed from route parameters after capture and invalidated locally on resend, including failed delivery. Use the configured `aayuva://verify-email` route for reviewed registration links; actual link handling still needs platform evidence. The app communicates only with NestJS, never Twilio/Resend directly.

Tests use controlled backend outcomes and isolated native-storage/fetch substitutes; none is a runtime feature toggle. See [account validation](../docs/account-validation.md) and [current inventory](../docs/account-files.md). DEV-017 remains open until compatible Expo Go and real Android/iOS workflow, keyboard, screen-reader and lifecycle evidence is captured. Historical [foundation dependency findings](../docs/foundation-validation.md) remain release-remediation gates.

For the owner's iPhone test, `npm run manual:start` starts the separate `manual-app` Expo entry on port 8083. It reuses registration screens with a paired local API, serialized test SecureStore key and transient email-link paste. `npm run manual:build` verifies its iOS export. It is absent from the normal Router entry, requires development mode and resolves the parent's installed dependencies. Follow [manual app testing](../docs/manual-app-testing.md) for setup and evidence. Codes/links are entered in the app for this path.
