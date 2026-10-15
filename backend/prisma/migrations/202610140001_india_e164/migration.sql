-- Review: libphonenumber-js metadata recognizes valid Indian numbering classes
-- with national lengths other than ten. The country-only policy must not be
-- narrowed by a structural DB regex. Metadata validation and successful SMS
-- verification remain required; this DDL never establishes verification.
-- Preserve E.164's 15-digit maximum and all existing identity/state invariants.
ALTER TABLE "User" DROP CONSTRAINT "User_verified_contacts_check";
ALTER TABLE "User" ADD CONSTRAINT "User_verified_contacts_check" CHECK (
  ("phone" IS NULL) = ("phoneVerifiedAt" IS NULL) AND
  ("email" IS NULL) = ("emailVerifiedAt" IS NULL) AND
  ("phone" IS NULL OR "phone" ~ '^\+91[0-9]{1,13}$') AND
  ("email" IS NULL OR "email" = lower(btrim("email")))
);
ALTER TABLE "PendingRegistration" DROP CONSTRAINT "PendingRegistration_state_check";
ALTER TABLE "PendingRegistration" ADD CONSTRAINT "PendingRegistration_state_check" CHECK (
  "expiresAt" > "createdAt" AND "expiresAt" <= "createdAt" + INTERVAL '30 minutes' AND
  "emailGeneration" >= 0 AND char_length("primarySubject") > 0 AND
  ("capabilityHash" IS NULL OR "capabilityHash" ~ '^[0-9a-f]{64}$') AND
  ("status" <> 'ACTIVE' OR "capabilityHash" IS NOT NULL) AND
  ("phone" IS NULL OR "phone" ~ '^\+91[0-9]{1,13}$') AND
  ("phoneVerifiedAt" IS NULL OR "phone" IS NOT NULL) AND
  ("email" IS NULL OR "email" = lower(btrim("email"))) AND
  ("emailVerifiedAt" IS NULL OR "email" IS NOT NULL) AND
  (("status" = 'COMPLETED' AND "completedAt" IS NOT NULL AND "completedUserId" IS NOT NULL) OR
   ("status" <> 'COMPLETED' AND "completedAt" IS NULL AND "completedUserId" IS NULL))
);
ALTER TABLE "PhoneChallenge" DROP CONSTRAINT "PhoneChallenge_binding_check";
ALTER TABLE "PhoneChallenge" ADD CONSTRAINT "PhoneChallenge_binding_check" CHECK (
  "purpose" = 'registration_phone' AND "phone" ~ '^\+91[0-9]{1,13}$' AND
  "providerServiceSid" ~ '^VA[0-9a-fA-F]{32}$' AND
  ("providerSid" IS NULL OR "providerSid" ~ '^VE[0-9a-fA-F]{32}$') AND
  "failedChecks" BETWEEN 0 AND 5 AND "expiresAt" > "createdAt" AND
  "expiresAt" <= "createdAt" + INTERVAL '10 minutes' AND
  ("status" NOT IN ('APPROVED', 'CONSUMED') OR "approvedAt" IS NOT NULL)
);
