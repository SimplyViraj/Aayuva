# AAyuva mobile

DEV-003–DEV-009 foundation: React Native with Expo Router, TypeScript, shared transport/storage and an access-boundary component. The initial screen displays the application name. Real sign-in, onboarding and restoration journeys remain their later tasks.

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

DEV-004 provides getMobileEnvironment with explicit public app/API settings; copy .env.example to .env before API integration. HTTP is permitted only in a development build with an explicit development/test environment. Release builds require HTTPS; credentials, query strings and fragments in the base URL are rejected without echoing their values. The Expo public settings are not secrets.

DEV-005 provides StateNotice for loading, error, empty, success and denied feedback. Supply reviewed user-facing messages rather than raw provider/transport exceptions. The component supports text scaling and an accessible retry action. Real Android/iOS screen-reader, keyboard and lifecycle evidence is still required at the phase/platform gates.

DEV-008 provides `ApiClient`: pass the validated public API base, a reviewed explicit request timeout and a contract decoder for every response. It keeps calls within that base, treats credentials as opaque, maps safe errors, supports cancellation and never automatically retries sensitive operations. Timeout/cancellation can leave the server outcome unknown; future workflow recovery must use its approved contract. Test deadlines are not deployment policy.

`CredentialStore` serializes native SecureStore reads/writes/removal and reports sanitized failures. Its default adapter is real native storage; injectable substitutes occur only in tests. Refresh credentials use `WHEN_UNLOCKED_THIS_DEVICE_ONLY` on iOS. No access decision follows from credential presence. Platform uninstall, backup, device-lock and interrupted storage behavior still need device evidence.

`BackendAccessBoundary` renders protected children only after its supplied backend checker permits access; changed checks and obsolete async completions cannot restore old content. It handles loading, sign-out, denial, failures and explicit retry. It is not wired into a real authentication/restoration journey yet. Future callers must use backend responses, clear obsolete context and supply a stable checker rather than decoding a JWT or trusting provider SDK state.

Tests use explicit fake timers, controlled response promises and isolated native-storage/fetch substitutes; none is a runtime feature toggle. See [foundation evidence and dependency findings](../docs/foundation-validation.md) for the current candidate and outstanding phase review.
