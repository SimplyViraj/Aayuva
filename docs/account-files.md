# DEL-002 file inventory — 2026-10-15

Current DEV-010–DEV-016, DEV-017 code and IT-005/IT-006 rehearsal/manual-app candidate, including affected foundation regression files. Changes are compared with the SHA-256 snapshot in foundation-files.md, not a Git diff (no repository exists). Only tasks.md changed among the original four source documents. Generated code, dependencies, output/cache files, private environment files and fixture data are excluded.

## Account implementation files added or modified

| File | Change since foundation snapshot |
| --- | --- |
| [backend/.env.example](../backend/.env.example) | Modified |
| [backend/eslint.config.mjs](../backend/eslint.config.mjs) | Modified |
| [backend/jest.database.config.mjs](../backend/jest.database.config.mjs) | Modified |
| [backend/package.json](../backend/package.json) | Modified |
| [backend/package-lock.json](../backend/package-lock.json) | Modified |
| [backend/prisma/migrations/202610130002_account/migration.sql](../backend/prisma/migrations/202610130002_account/migration.sql) | Added |
| [backend/prisma/migrations/202610140001_india_e164/migration.sql](../backend/prisma/migrations/202610140001_india_e164/migration.sql) | Added |
| [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) | Modified |
| [backend/README.md](../backend/README.md) | Modified |
| [backend/scripts/manual-email-diagnostics.mjs](../backend/scripts/manual-email-diagnostics.mjs) | Added |
| [backend/scripts/manual-email-diagnostics.test.mjs](../backend/scripts/manual-email-diagnostics.test.mjs) | Added |
| [backend/scripts/manual-registration-server.mjs](../backend/scripts/manual-registration-server.mjs) | Added |
| [backend/scripts/manual-registration-server.test.mjs](../backend/scripts/manual-registration-server.test.mjs) | Added |
| [backend/scripts/registration-provider-rehearsal.mjs](../backend/scripts/registration-provider-rehearsal.mjs) | Added |
| [backend/scripts/registration-provider-rehearsal.test.mjs](../backend/scripts/registration-provider-rehearsal.test.mjs) | Added |
| [backend/src/config/environment.ts](../backend/src/config/environment.ts) | Modified |
| [backend/src/database/registration-transaction.ts](../backend/src/database/registration-transaction.ts) | Added |
| [backend/src/modules/auth/auth.module.ts](../backend/src/modules/auth/auth.module.ts) | Modified |
| [backend/src/modules/auth/providers/provider-response.ts](../backend/src/modules/auth/providers/provider-response.ts) | Added |
| [backend/src/modules/auth/providers/resend-registration.ts](../backend/src/modules/auth/providers/resend-registration.ts) | Added |
| [backend/src/modules/auth/providers/twilio-verify.ts](../backend/src/modules/auth/providers/twilio-verify.ts) | Added |
| [backend/src/modules/auth/registration/account-registration.service.ts](../backend/src/modules/auth/registration/account-registration.service.ts) | Added |
| [backend/src/modules/auth/registration/capabilities.ts](../backend/src/modules/auth/registration/capabilities.ts) | Added |
| [backend/src/modules/auth/registration/email-verification.service.ts](../backend/src/modules/auth/registration/email-verification.service.ts) | Added |
| [backend/src/modules/auth/registration/pending-context.service.ts](../backend/src/modules/auth/registration/pending-context.service.ts) | Added |
| [backend/src/modules/auth/registration/phone-verification.service.ts](../backend/src/modules/auth/registration/phone-verification.service.ts) | Added |
| [backend/src/modules/auth/registration/rate-limits.service.ts](../backend/src/modules/auth/registration/rate-limits.service.ts) | Added |
| [backend/src/modules/auth/registration/registration.controller.ts](../backend/src/modules/auth/registration/registration.controller.ts) | Added |
| [backend/src/modules/auth/registration/registration.dto.ts](../backend/src/modules/auth/registration/registration.dto.ts) | Added |
| [backend/src/modules/auth/registration/registration.module.ts](../backend/src/modules/auth/registration/registration.module.ts) | Added |
| [backend/src/modules/auth/registration/registration-identity.guard.ts](../backend/src/modules/auth/registration/registration-identity.guard.ts) | Added |
| [backend/src/modules/auth/registration/registration-maintenance.service.ts](../backend/src/modules/auth/registration/registration-maintenance.service.ts) | Added |
| [backend/src/modules/auth/registration/registration-operations.ts](../backend/src/modules/auth/registration/registration-operations.ts) | Added |
| [backend/src/modules/auth/session-authenticator.ts](../backend/src/modules/auth/session-authenticator.ts) | Modified |
| [backend/src/modules/identity/identity.module.ts](../backend/src/modules/identity/identity.module.ts) | Added |
| [backend/src/modules/identity/identity.service.ts](../backend/src/modules/identity/identity.service.ts) | Added |
| [backend/src/modules/identity/normalization.ts](../backend/src/modules/identity/normalization.ts) | Added |
| [backend/src/modules/sessions/session-store.service.ts](../backend/src/modules/sessions/session-store.service.ts) | Modified |
| [backend/test/access-verification.spec.ts](../backend/test/access-verification.spec.ts) | Modified |
| [backend/test/database/account.database.spec.ts](../backend/test/database/account.database.spec.ts) | Added |
| [backend/test/database/email-verification.database.spec.ts](../backend/test/database/email-verification.database.spec.ts) | Added |
| [backend/test/database/phone-verification.database.spec.ts](../backend/test/database/phone-verification.database.spec.ts) | Added |
| [backend/test/database/registration-api.database.spec.ts](../backend/test/database/registration-api.database.spec.ts) | Added |
| [backend/test/normalization.spec.ts](../backend/test/normalization.spec.ts) | Added |
| [backend/test/registration-providers.spec.ts](../backend/test/registration-providers.spec.ts) | Added |
| [mobile/.env.example](../mobile/.env.example) | Modified |
| [mobile/__tests__/manual-registration.test.tsx](../mobile/__tests__/manual-registration.test.tsx) | Added |
| [mobile/__tests__/registration.test.tsx](../mobile/__tests__/registration.test.tsx) | Added |
| [mobile/__tests__/registration-api.test.ts](../mobile/__tests__/registration-api.test.ts) | Added |
| [mobile/app/_layout.tsx](../mobile/app/_layout.tsx) | Modified |
| [mobile/app/index.tsx](../mobile/app/index.tsx) | Modified |
| [mobile/app/register.tsx](../mobile/app/register.tsx) | Added |
| [mobile/app/verify-email.tsx](../mobile/app/verify-email.tsx) | Added |
| [mobile/app/verify-phone.tsx](../mobile/app/verify-phone.tsx) | Added |
| [mobile/manual-app/app.json](../mobile/manual-app/app.json) | Added |
| [mobile/manual-app/index.tsx](../mobile/manual-app/index.tsx) | Added |
| [mobile/manual-app/ManualRegistrationApp.tsx](../mobile/manual-app/ManualRegistrationApp.tsx) | Added |
| [mobile/manual-app/metro.config.cjs](../mobile/manual-app/metro.config.cjs) | Added |
| [mobile/manual-app/package.json](../mobile/manual-app/package.json) | Added |
| [mobile/manual-app/tsconfig.json](../mobile/manual-app/tsconfig.json) | Added |
| [mobile/package.json](../mobile/package.json) | Modified |
| [mobile/README.md](../mobile/README.md) | Modified |
| [mobile/src/features/auth/components/RegistrationFrame.tsx](../mobile/src/features/auth/components/RegistrationFrame.tsx) | Added |
| [mobile/src/features/auth/components/RegistrationScreens.tsx](../mobile/src/features/auth/components/RegistrationScreens.tsx) | Added |
| [mobile/src/features/auth/hooks/use-registration-operation.ts](../mobile/src/features/auth/hooks/use-registration-operation.ts) | Added |
| [mobile/src/features/auth/services/pending-store.ts](../mobile/src/features/auth/services/pending-store.ts) | Added |
| [mobile/src/features/auth/services/registration-api.ts](../mobile/src/features/auth/services/registration-api.ts) | Added |
| [mobile/src/lib/api/client.ts](../mobile/src/lib/api/client.ts) | Modified |
| [mobile/src/providers/RegistrationProvider.tsx](../mobile/src/providers/RegistrationProvider.tsx) | Added |
| [mobile/tsconfig.json](../mobile/tsconfig.json) | Modified |

## Task and documentation files

Documents record approvals, reviews, results and current task status. Historical foundation hashes are preserved. This inventory excludes its own hash to avoid self-reference. The missing backend/.env.example was restored with placeholders only; private backend/.env is excluded. The 15 October troubleshooting changed only its local sender setting; no secret or personal identifier is copied here.

| File | DEL-002 change |
| --- | --- |
| [tasks.md](../tasks.md) | Updated task/evidence and manual-app status |
| [docs/account-readiness.md](../docs/account-readiness.md) | Updated approved R2 and provider-readiness disposition |
| [docs/social-sign-in-readiness.md](../docs/social-sign-in-readiness.md) | Added owner-requested Google/Apple R3 technical proposal; approval pending, no runtime implementation |
| [docs/account-persistence.md](../docs/account-persistence.md) | Added schema/follow-up migration review |
| [docs/account-validation.md](../docs/account-validation.md) | Added results, traceability, review, preflight/rehearsal/manual-app evidence and remaining gates |
| [docs/account-files.md](../docs/account-files.md) | Added current inventory/fingerprints |
| [docs/manual-app-testing.md](../docs/manual-app-testing.md) | Added iPhone Expo Go paired test guide |
| [docs/approved-policies.md](../docs/approved-policies.md) | Updated owner decisions/provider readiness |
| [docs/execution-register.md](../docs/execution-register.md) | Updated execution/decision ledger |
| [docs/foundation-validation.md](../docs/foundation-validation.md) | Labeled historical evidence and linked current results |
| [docs/foundation-files.md](../docs/foundation-files.md) | Labeled historical inventory and linked current candidate |

## 15 October email follow-up files

DEV-014 / DEV-017 and IT-005 / IT-006 troubleshooting changed these source/test/config files: backend/scripts/manual-email-diagnostics.mjs (new), backend/scripts/manual-email-diagnostics.test.mjs (new), backend/scripts/manual-registration-server.mjs, backend/package.json, mobile/src/features/auth/components/RegistrationScreens.tsx and mobile/__tests__/registration.test.tsx. Updated documentation: tasks.md, docs/manual-app-testing.md, docs/account-validation.md, docs/execution-register.md and this inventory. Earlier in the same troubleshooting, only REGISTRATION_EMAIL_SENDER changed in private backend/.env; that file is excluded. Generated output/logs are excluded. No dependency version, database schema, production activation or later task changed.

The later registration-start connection follow-up additionally modifies mobile/manual-app/ManualRegistrationApp.tsx and mobile/__tests__/manual-registration.test.tsx, plus the same task/validation/manual-guide/ledger documentation. Scoped lint, strict TypeScript and four manual-launcher tests pass; phone-to-API reachability remains pending.

## Current application/configuration/test/migration SHA-256 snapshot

All 116 application/configuration/test/migration files are included; 70 were added or modified since the foundation snapshot. Unchanged files are included here for reproduction. Includes the 15 October failed-email cooldown and manual-only diagnostic changes.

| File | SHA-256 |
| --- | --- |
| backend/.env.example | 57cf98fa2b0189cc477691fe2c79ea885d5b15211b721ecb63265b4ae2b86c9b |
| backend/eslint.config.mjs | 4dfe8c2dd09fba7ad5e03e9050af873f0b6ff9ac6047f6fed2c6b40e7a1bcbf9 |
| backend/jest.config.cjs | a8b751892062cd145534c3e327c58924288fc6e160750659851671dbe1674b9e |
| backend/jest.database.config.mjs | 968bf8b0156a47fdf8545f989fd15e0ab313dd703058c4047db6080bd7d88bba |
| backend/package-lock.json | a76f16678f8cbb5b88837acda1a2afb5305f20c1d7fdbd5c712f3014ab1f8a97 |
| backend/package.json | 6617b23a57d5ba84337a472245e74ac981339240d3836a370846f3bbec5fd499 |
| backend/prisma.config.ts | be8f9f1fa16d8564c958ec47d5fcf720ac410c35b4fefdb578013ed0a0a1ac0e |
| backend/prisma/migrations/202610130001_foundation/migration.sql | e30dab486a0a9086231770fc4d3415d925d64841a470560afebc074413b78f11 |
| backend/prisma/migrations/202610130002_account/migration.sql | fabc56220317391ce90dc55b6c1d86f8347ee1497fbb35ae10c8e84201d99df0 |
| backend/prisma/migrations/202610140001_india_e164/migration.sql | 5db6a7bbdf7fe251d3134cc0c22bd5f7d8de297bff17065aa2f93784486ad7ea |
| backend/prisma/migrations/migration_lock.toml | 1db17a8d051aa136110736752c5e1f8b7ed92b6ea8e803112fbbe2497047c210 |
| backend/prisma/schema.prisma | 84c402c538c611e55da13067ab9d1def8bd8ba9c00510b5b909220a875ad7010 |
| backend/README.md | d5100904c9972408f08164f9e19007b5469f35a2c7f1c6f93e3bc5e2c76609b9 |
| backend/scripts/manual-email-diagnostics.mjs | 5aeaf20b81ce1d71b6e0c0d1e74b63a5936ce9910af9e82245a0d1f6f61b5aba |
| backend/scripts/manual-email-diagnostics.test.mjs | edfec85267b9fe36ac24d3256f5456e148e6c069e444e57fa1911fe700d7ca84 |
| backend/scripts/manual-registration-server.mjs | 49f61d9811f6d94f1113a462ada648cc904b9323da972a37717a6220bc6d9867 |
| backend/scripts/manual-registration-server.test.mjs | b3531722cc67dd4335eb9b2580b8f1af9d9854194a20d9fd2f2a874a0e23f3af |
| backend/scripts/migrate-test-database.mjs | 5755f2805aeb7422eeadcf379dc76b817b82240a222b048aa4ee39c66d3c13c2 |
| backend/scripts/registration-provider-rehearsal.mjs | 6556f917be0a8310d014425b37192a762ceafc7ec843ea1a8226b3e6b760ff53 |
| backend/scripts/registration-provider-rehearsal.test.mjs | 6585f19e10a91a501a15795d246543c5840963cf6503b9b5bec9ae91b41c70dd |
| backend/scripts/test-database-url.d.mts | 53fcfa77a38525f5b5450c96762d455af5a84ef0d6f20c1f647a775000b6ad38 |
| backend/scripts/test-database-url.mjs | e0ad165c3982aab50cfd748a16e5e3549f5d75ac9e3a1fc4eca0fb217d30c980 |
| backend/scripts/test-database.mjs | 7925d8986627779f8e80897dacfbcb418c29b973831139f14aeedec5a8d258f2 |
| backend/src/app.module.ts | 2fb13a12a65f71e0bde278a2c92e1df9ba6d9d11d8ea15f305094c0c4b3e1fdc |
| backend/src/common/api-error.dto.ts | 7bcf979e1b3b753d9821a8072a638539797adb6b39f413d900213f526f81dced |
| backend/src/common/api-exception.filter.ts | 727d04f3250f5f1c6e984f9a71a31703a915cd24a053599a1849c81c28daf190 |
| backend/src/common/common.module.ts | cac369ee969db515723c68fb38050406c0a0ea642936d436c08bcc62a4cc4d76 |
| backend/src/common/request-context.middleware.ts | e4fbcc0408a0e54f976c6fdc04bddfaac0e3a9d610d6567096dfb05309298446 |
| backend/src/common/safe-logger.service.ts | d1a46a68bb20b9d9b4505e32b5e0362029ff2625f389b0fd14c6e76f7b724669 |
| backend/src/common/validation.ts | d3d3fcda8d2c72ae319235887fb66d5148d58374da0c3c0645e3d51321750e49 |
| backend/src/config/environment.ts | 315950aa3fae309f0c0f062f0acabfd1785c0ad544821b6776cb15688736422c |
| backend/src/database/database.module.ts | 7a1e197b1215f5ca01b3202a66ecc72f751e35ca68030c9d50365fc43db07cda |
| backend/src/database/prisma.service.ts | 124bd0215c0347b2b46623ac3d446c5e6c331eff90568be935ca86a8ab9bc240 |
| backend/src/database/registration-transaction.ts | 469965a81d92304019373bae26220ccc13ac0d1542e6bf0c4785cd8f4b7ff65a |
| backend/src/main.ts | bc44580a63f59c38c0cef6e79b3021b67a58e8a52266af6c6e3062198510288f |
| backend/src/modules/auth/auth.module.ts | effaa7bb129fb81f4f569551a15907126f7d637bd4893a227c18cdbec2f1ec0c |
| backend/src/modules/auth/jwt-access-verifier.ts | 531ee23b919254d57897eb69706ea754251e0db6e153d810254b76bd8606b3c2 |
| backend/src/modules/auth/providers/provider-response.ts | 56927f75dbe353bc2ee01b31ac561c73fadc69a4836f5ef5a5c80616515bffd4 |
| backend/src/modules/auth/providers/resend-registration.ts | 920a77f037750319cbc3d0d6930cd54ee8035d041cafbb5739bd1b303980a023 |
| backend/src/modules/auth/providers/twilio-verify.ts | 65d612d035ef2741cdeafa4800a9ae82b570f1b7c1392d5d154ee7f1d785bc66 |
| backend/src/modules/auth/registration/account-registration.service.ts | 57503883dac05c496f9bf93e985d54901a338631edc0b3a538854a47f637a669 |
| backend/src/modules/auth/registration/capabilities.ts | c214da607b471d7fee01f3b0cf646560bd84c37fed47b4e4025b8f71239dbdf4 |
| backend/src/modules/auth/registration/email-verification.service.ts | 750acd208467e67707d1303438537a44996308dab7e37091cf39ff8c356eecd7 |
| backend/src/modules/auth/registration/pending-context.service.ts | a1a9066945ee434c84e4c7494a213a6793f12ed9b9db4fad41b2f7996d5fec1b |
| backend/src/modules/auth/registration/phone-verification.service.ts | 319c51dc27e7622fb9b0b1ee4ebcbbd1ddb4b372bbefd2c9d8a099a91c5731ed |
| backend/src/modules/auth/registration/rate-limits.service.ts | 6629a4f01198aaebb7ff18070054b0dfc560daaf7e9c49210820a533b2e8790f |
| backend/src/modules/auth/registration/registration-identity.guard.ts | 338598af12f78a312ceb7b1f9e8978b158415409be6f4800998656fd7e7ac2f8 |
| backend/src/modules/auth/registration/registration-maintenance.service.ts | f890869a94ebb4aab72a8dd994abb633cc8cf3a2641c1a020ed2bdaac4786721 |
| backend/src/modules/auth/registration/registration-operations.ts | 199392f24ba82a4b0ac4c7a17fe53aaeff32a0c935018b334e00af9fa45a2d34 |
| backend/src/modules/auth/registration/registration.controller.ts | 1ac27e9e67208b24217b062c21338fd697a8f359a608c0e315d4473290b19a03 |
| backend/src/modules/auth/registration/registration.dto.ts | b879c39359b2e2f06783b7d847a615b1486d3ec4cf698082f80399982bd25aad |
| backend/src/modules/auth/registration/registration.module.ts | b29b21405ab4b11d0f83155af646a126a8d501adc8c34b11c4b61fbd297f2615 |
| backend/src/modules/auth/request-authentication.guard.ts | c55fbe676aa7b631ce24894b6f7b69146c8210c6892f505373bab6faaaf84bd6 |
| backend/src/modules/auth/session-authenticator.ts | e68c946324e4d2900bfa85d8fe103f4a1c98e773aac54fbaff97a860eb4a3770 |
| backend/src/modules/authorization/authorization.guard.ts | 4de04dbe54c2c0cde386ab5f8c99ddace20613e24e9354089f090e4f0703b2ca |
| backend/src/modules/identity/identity.module.ts | 3b5685e6cd7181ab37b82c7dd73a63a9010b58d745beb92c9d54243c59858d35 |
| backend/src/modules/identity/identity.service.ts | 365954e32eb517ee5943fb6b76a727618caa61deda51fe088f33a09cbe043786 |
| backend/src/modules/identity/normalization.ts | 1979ac2449587354b447070b70c3dd26cc29cb0ff66fec254bddb524643936f3 |
| backend/src/modules/sessions/session-store.service.ts | 8a309eed6fed3d505a441b69e6fecbdcac392661af04035d71e294b899466d78 |
| backend/src/modules/sessions/sessions.module.ts | d4374a13c40824191363fc93c83b70af86963c60705ad046b8f9adbed6a7b4b7 |
| backend/test/access-guards.spec.ts | 9b11cf79fc37bd65a1dbe3660b681377aba62c3ac05e4451bb233d94d84260fc |
| backend/test/access-verification.spec.ts | a2cd18c06fddfa014b600275646af0dc62e8d1d56bbbc2878ab991d4d478e48d |
| backend/test/bootstrap.spec.ts | 78cb3903a40a644d42c732d99b8dc1236fb0eba6930deb08265e283d444f3ce0 |
| backend/test/database-guard.spec.ts | e001e0ee9060c5c359943d381bd6c87816b61ee0dc1d24d224ef8876bb53c0c3 |
| backend/test/database/account.database.spec.ts | 84ef85a97be98614379cef012c8c7884695d9b80ab0d7fddb09c2674bfb5f08c |
| backend/test/database/email-verification.database.spec.ts | 7202538374b10965ec00a6f56fe18e36bbe757ab2cf195c4ff57a2e1597ad4e0 |
| backend/test/database/foundation.database.spec.ts | a6e5c0886e590d7a3e779cb49663e33b0f18cd0481557c573a04cf640190cd2a |
| backend/test/database/phone-verification.database.spec.ts | 2946bb1af17eed09062a0e3a98dafa823f0c987823110a6af7fff68ee68efb7d |
| backend/test/database/registration-api.database.spec.ts | d7a9f938a4a9cc2caa952bfcde220575fc73f708ecc6aa4e20b0de33aeb2227e |
| backend/test/diagnostics.spec.ts | de7790118dff0573292ffe2ffca19656f9d8d3979d88de106f2e82c76d4d6c88 |
| backend/test/environment.spec.ts | b824b771437d64229f6a9cc5b38d1b8a3ccbf5e220f9632a97d7afa6e0951f84 |
| backend/test/helpers/clock.ts | 2b0c76c0f362b2b791a9afe0717debe2bb8eaf0bac0a94e3475753c306ea0fbf |
| backend/test/normalization.spec.ts | 0176babf28f07d9cefcffbfa3f47110707bd68bf585f1ab441ad162ad0cb04dd |
| backend/test/registration-providers.spec.ts | 0b4c6d51396e501a54982b5c6a5cd6460f56b00a632d6ccce8d8a409ebee6c2a |
| backend/tsconfig.build.json | c80914ce143a1749de4f0b8c1cf3ad6d6aa228c6ee5502eec26ad7dc5dd06c7f |
| backend/tsconfig.json | 19f7e31246f9e0f324b673b13d81c98a45ae340f1d1b741ad104c6a40765b84d |
| mobile/__tests__/access-boundary.test.tsx | 7aa6741e04d785a388c729576c94483dd4b82eb277abf3a3a966fa7c1ba82b34 |
| mobile/__tests__/api-client.test.ts | 8d0bf03fcecba5ae16ccf3cdc9730763b9c524e0cc9797a60363ead12d939b7f |
| mobile/__tests__/credential-store.test.ts | ce42b240b7b73ee04b827c267cc95bb1d099b002ac97d270c7bb889883d8163a |
| mobile/__tests__/entry.test.tsx | 8bd6dc5e819989253f9e84a5731ad414eb93ec8b7d2a4d1a56ef3c4334413516 |
| mobile/__tests__/environment.test.ts | 029b09e02b364fd0d8d12516d18789811625765683c19d44cbc8a48695c7338c |
| mobile/__tests__/feedback.test.tsx | fd2c615afb2c04472f28f395d66b42b512f2d20c31debff4de7406cbe6e2e1b5 |
| mobile/__tests__/manual-registration.test.tsx | 709fe03c37db0c7eec9f4a2a496e256357551aa3de29374ece7508d5470c6a90 |
| mobile/__tests__/registration-api.test.ts | a82841d29bc0a145736bdb4c4fe3838df6a4ab2dbabedc749e747ecdd1f0d4ac |
| mobile/__tests__/registration.test.tsx | f1ef11d2d00f287bca395ba32779f2bb3afab1bcf3d28e76d9524371d92e1aa8 |
| mobile/.env.example | 4c4f9ad91cd688a8b20f3375b493bb13d82bf94af57d35e466353de84800aa13 |
| mobile/app.json | a2c6fccfcb076c24eac49ca8501a6f548d72c2cf5e1152e4f175e2c4e9f9674d |
| mobile/app/_layout.tsx | 9dbbfde28e3e2c103e1486b26f54c925a179c72d1b296785041d13c027f3c352 |
| mobile/app/index.tsx | 622af8e51748a909d8bedef6e65b3ec3b9a046d9190a7dad354ea0f4588adc8a |
| mobile/app/register.tsx | 0969363bcae1a6e6bfcad38198dc835f5d7ddbd3028270b52c253be3c3383a5f |
| mobile/app/verify-email.tsx | 7db0be8c8ff88ebff0edc8863b608cfe0c63edbdd591023ac3df803ff9e9db0d |
| mobile/app/verify-phone.tsx | 2c807b9e53ff8dfd59203693acd41ea945b5d8407a19766d32462312ac90a8ab |
| mobile/eslint.config.mjs | fc7cf1d459213d687ab22d33f80a182fddb506e8292e0f32082d24486d877bcd |
| mobile/jest.config.cjs | 22da8b3dfece52542d6262f99eb68b1217897b602d140f9023b60f2a117ea6ff |
| mobile/manual-app/app.json | e00543d01e9e708b6525d69ddfae8ea62bfd7e6b6bdf790e04ed9914d52f4c9c |
| mobile/manual-app/index.tsx | 29ffe19ec40f8d00aa9bfc57aa1b9d8b4560ead63eaf433fd8ad4eae6d7a0bc4 |
| mobile/manual-app/ManualRegistrationApp.tsx | 69d244f854e1c4a1a35a687811f4a75e23a33237fe86e3c5bffae2334673a0b7 |
| mobile/manual-app/metro.config.cjs | e3d9a366f969098d248cd323d82f7468273a56b8a7dae5e7f033c82b6b2ca244 |
| mobile/manual-app/package.json | 20ee95edc81349a9c75f3b7f0559b6263a216e09a6b724ea0ab4c98c60bb32f9 |
| mobile/manual-app/tsconfig.json | d68261f2242dab37fbf09519d5cdfabc2660ee64c5001ff51760cd124b75b5df |
| mobile/package-lock.json | d7df4e1ea92e6cf065866e68bcf36bf0eadeaa6d263e5aef49b6e55e163419b0 |
| mobile/package.json | 3301d74f17aecee622dae60143ecf02a0e07d7438814003366694cd9e2094487 |
| mobile/README.md | 2a27f5980448b4e7d5b9c0de0c0236c584d68cc7a9113e9b1a1ef477827dad52 |
| mobile/src/components/feedback/StateNotice.tsx | 2842258a8bc6f6641600a47a9e4d38141d9ec559acca3a3b5e90380bf1d59fa8 |
| mobile/src/features/auth/components/RegistrationFrame.tsx | 13c5f7ffe3866cb1a579e342df910f855e1cfe47bc158f73fac10cd38f53b3dd |
| mobile/src/features/auth/components/RegistrationScreens.tsx | 807ed2a7833e558869f9cf1781265fa69fed82ce5f77f2fdeb280843f42cad7d |
| mobile/src/features/auth/hooks/use-registration-operation.ts | e2603aac5527b3efb4d2e965d6ff420a13ef54e3f6123802aeaca4c107f24e85 |
| mobile/src/features/auth/services/pending-store.ts | db92f2b1878f31bdb196abea57b65b4942c34601334a44a3573500c8a7d5b960 |
| mobile/src/features/auth/services/registration-api.ts | a1290e421236db9edee67c8031bb2bee2751db9399a6506a49f033bb3a1b79f9 |
| mobile/src/lib/api/client.ts | 646fa88f9b47ae540b0cccbc15a816ac1a215da5853edc2a0cfbe391e5baafab |
| mobile/src/lib/config/environment.ts | fd644057144d86d740e16e2ea1cf7a49a8bdeb7523d2e07778a195805e695b42 |
| mobile/src/lib/config/index.ts | c50db13c62db75b95f698724772b29d4a8382f5ce2eafac0838b7272fac047f0 |
| mobile/src/lib/storage/credential-store.ts | 0c098e29d4e311e8c450a26dbda775d0222cef37011d1e96f8fa1df16cc7332f |
| mobile/src/providers/BackendAccessBoundary.tsx | 19c58f946ab0878a75fa842a3208dc8f8a396467602e34a0b0c928006c432de5 |
| mobile/src/providers/RegistrationProvider.tsx | 340b9945602a2d0ed54fa8909726d3aac304981ff49f32ac36ba7b867536884e |
| mobile/tsconfig.json | f768e97fa164cdf2a6b4fba81a9cabb431eefc887db093c9f0b984f1b971a2bd |
