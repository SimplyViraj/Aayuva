-- CreateEnum
CREATE TYPE "RegistrationMethod" AS ENUM ('EMAIL_PASSWORD', 'PHONE', 'GOOGLE', 'APPLE');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ONBOARDING', 'ACTIVE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMBER', 'OPERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "PendingStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PhoneChallengeStatus" AS ENUM ('ISSUING', 'PENDING', 'CHECKING', 'APPROVED', 'CONSUMED', 'CANCELLED', 'EXPIRED', 'INDETERMINATE');

-- CreateEnum
CREATE TYPE "EmailAuthorizationStatus" AS ENUM ('ACTIVE', 'CONSUMED', 'SUPERSEDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'INDETERMINATE');

-- CreateEnum
CREATE TYPE "RegistrationOperation" AS ENUM ('BEGIN', 'PHONE_SEND', 'PHONE_CHECK', 'EMAIL_SEND', 'EMAIL_CHECK');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "completedAt" TIMESTAMPTZ(3),
ADD COLUMN     "displayName" VARCHAR(100),
ADD COLUMN     "email" VARCHAR(254),
ADD COLUMN     "emailVerifiedAt" TIMESTAMPTZ(3),
ADD COLUMN     "phone" VARCHAR(16),
ADD COLUMN     "phoneVerifiedAt" TIMESTAMPTZ(3),
ADD COLUMN     "primaryMethod" "RegistrationMethod",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MEMBER',
ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'ONBOARDING';

-- CreateTable
CREATE TABLE "UserIdentity" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "method" "RegistrationMethod" NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingRegistration" (
    "id" UUID NOT NULL,
    "capabilityHash" CHAR(64),
    "status" "PendingStatus" NOT NULL DEFAULT 'ACTIVE',
    "primaryMethod" "RegistrationMethod" NOT NULL,
    "primarySubject" VARCHAR(255) NOT NULL,
    "displayName" VARCHAR(100),
    "phone" VARCHAR(16),
    "phoneVerifiedAt" TIMESTAMPTZ(3),
    "email" VARCHAR(254),
    "emailVerifiedAt" TIMESTAMPTZ(3),
    "emailGeneration" INTEGER NOT NULL DEFAULT 0,
    "emailLastIssuedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "completedAt" TIMESTAMPTZ(3),
    "completedUserId" UUID,

    CONSTRAINT "PendingRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneChallenge" (
    "id" UUID NOT NULL,
    "pendingId" UUID NOT NULL,
    "purpose" VARCHAR(32) NOT NULL DEFAULT 'registration_phone',
    "phone" VARCHAR(16) NOT NULL,
    "providerServiceSid" VARCHAR(34) NOT NULL,
    "providerSid" VARCHAR(34),
    "status" "PhoneChallengeStatus" NOT NULL DEFAULT 'ISSUING',
    "failedChecks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRequestedAt" TIMESTAMPTZ(3) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "approvedAt" TIMESTAMPTZ(3),

    CONSTRAINT "PhoneChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationEmailAuthorization" (
    "id" UUID NOT NULL,
    "pendingId" UUID NOT NULL,
    "purpose" VARCHAR(32) NOT NULL DEFAULT 'registration_email',
    "email" VARCHAR(254) NOT NULL,
    "tokenHash" CHAR(64),
    "generation" INTEGER NOT NULL,
    "status" "EmailAuthorizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "consumedAt" TIMESTAMPTZ(3),

    CONSTRAINT "RegistrationEmailAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationRateEvent" (
    "id" UUID NOT NULL,
    "keyId" VARCHAR(32) NOT NULL,
    "bucketHash" CHAR(64) NOT NULL,
    "operation" "RegistrationOperation" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationRateEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserIdentity_method_subject_key" ON "UserIdentity"("method", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "UserIdentity_userId_method_key" ON "UserIdentity"("userId", "method");

-- CreateIndex
CREATE UNIQUE INDEX "PendingRegistration_capabilityHash_key" ON "PendingRegistration"("capabilityHash");

-- CreateIndex
CREATE INDEX "PendingRegistration_expiresAt_idx" ON "PendingRegistration"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneChallenge_providerSid_key" ON "PhoneChallenge"("providerSid");

-- CreateIndex
CREATE INDEX "PhoneChallenge_pendingId_idx" ON "PhoneChallenge"("pendingId");

-- CreateIndex
CREATE INDEX "PhoneChallenge_expiresAt_idx" ON "PhoneChallenge"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationEmailAuthorization_tokenHash_key" ON "RegistrationEmailAuthorization"("tokenHash");

-- CreateIndex
CREATE INDEX "RegistrationEmailAuthorization_expiresAt_idx" ON "RegistrationEmailAuthorization"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationEmailAuthorization_pendingId_generation_key" ON "RegistrationEmailAuthorization"("pendingId", "generation");

-- CreateIndex
CREATE INDEX "RegistrationRateEvent_keyId_bucketHash_operation_createdAt_idx" ON "RegistrationRateEvent"("keyId", "bucketHash", "operation", "createdAt");

-- CreateIndex
CREATE INDEX "RegistrationRateEvent_createdAt_idx" ON "RegistrationRateEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "UserIdentity" ADD CONSTRAINT "UserIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingRegistration" ADD CONSTRAINT "PendingRegistration_completedUserId_fkey" FOREIGN KEY ("completedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneChallenge" ADD CONSTRAINT "PhoneChallenge_pendingId_fkey" FOREIGN KEY ("pendingId") REFERENCES "PendingRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationEmailAuthorization" ADD CONSTRAINT "RegistrationEmailAuthorization_pendingId_fkey" FOREIGN KEY ("pendingId") REFERENCES "PendingRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Prisma cannot express CHECK/partial unique constraints. Static migration DDL
-- enforces the reviewed canonical/purpose/state invariants alongside services.
ALTER TABLE "User" ADD CONSTRAINT "User_verified_contacts_check" CHECK (
  ("phone" IS NULL) = ("phoneVerifiedAt" IS NULL) AND
  ("email" IS NULL) = ("emailVerifiedAt" IS NULL) AND
  ("phone" IS NULL OR "phone" ~ '^\+91[0-9]{10}$') AND
  ("email" IS NULL OR "email" = lower(btrim("email")))
);
ALTER TABLE "User" ADD CONSTRAINT "User_active_prerequisites_check" CHECK (
  "status" <> 'ACTIVE' OR (
    "displayName" IS NOT NULL AND char_length(btrim("displayName")) BETWEEN 1 AND 100 AND
    "displayName" = btrim("displayName") AND "phone" IS NOT NULL AND
    "phoneVerifiedAt" IS NOT NULL AND "completedAt" IS NOT NULL AND "primaryMethod" IS NOT NULL AND
    ("primaryMethod" <> 'EMAIL_PASSWORD' OR ("email" IS NOT NULL AND "emailVerifiedAt" IS NOT NULL))
  )
);
ALTER TABLE "PendingRegistration" ADD CONSTRAINT "PendingRegistration_state_check" CHECK (
  "expiresAt" > "createdAt" AND "expiresAt" <= "createdAt" + INTERVAL '30 minutes' AND
  "emailGeneration" >= 0 AND char_length("primarySubject") > 0 AND
  ("capabilityHash" IS NULL OR "capabilityHash" ~ '^[0-9a-f]{64}$') AND
  ("status" <> 'ACTIVE' OR "capabilityHash" IS NOT NULL) AND
  ("phone" IS NULL OR "phone" ~ '^\+91[0-9]{10}$') AND
  ("phoneVerifiedAt" IS NULL OR "phone" IS NOT NULL) AND
  ("email" IS NULL OR "email" = lower(btrim("email"))) AND
  ("emailVerifiedAt" IS NULL OR "email" IS NOT NULL) AND
  (("status" = 'COMPLETED' AND "completedAt" IS NOT NULL AND "completedUserId" IS NOT NULL) OR
   ("status" <> 'COMPLETED' AND "completedAt" IS NULL AND "completedUserId" IS NULL))
);
ALTER TABLE "PhoneChallenge" ADD CONSTRAINT "PhoneChallenge_binding_check" CHECK (
  "purpose" = 'registration_phone' AND "phone" ~ '^\+91[0-9]{10}$' AND
  "providerServiceSid" ~ '^VA[0-9a-fA-F]{32}$' AND
  ("providerSid" IS NULL OR "providerSid" ~ '^VE[0-9a-fA-F]{32}$') AND
  "failedChecks" BETWEEN 0 AND 5 AND "expiresAt" > "createdAt" AND
  "expiresAt" <= "createdAt" + INTERVAL '10 minutes' AND
  ("status" NOT IN ('APPROVED', 'CONSUMED') OR "approvedAt" IS NOT NULL)
);
CREATE UNIQUE INDEX "PhoneChallenge_active_phone_key" ON "PhoneChallenge" ("phone")
  WHERE "status" IN ('ISSUING', 'PENDING', 'CHECKING', 'APPROVED', 'INDETERMINATE');
ALTER TABLE "RegistrationEmailAuthorization" ADD CONSTRAINT "RegistrationEmailAuthorization_binding_check" CHECK (
  "purpose" = 'registration_email' AND "email" = lower(btrim("email")) AND
  "generation" > 0 AND "expiresAt" > "createdAt" AND
  "expiresAt" <= "createdAt" + INTERVAL '5 minutes' AND
  (("status" = 'ACTIVE' AND "tokenHash" IS NOT NULL AND "tokenHash" ~ '^[0-9a-f]{64}$') OR
   ("status" <> 'ACTIVE' AND "tokenHash" IS NULL)) AND
  (("status" = 'CONSUMED' AND "consumedAt" IS NOT NULL) OR
   ("status" <> 'CONSUMED' AND "consumedAt" IS NULL))
);
ALTER TABLE "RegistrationRateEvent" ADD CONSTRAINT "RegistrationRateEvent_hash_check" CHECK (
  char_length("keyId") > 0 AND "bucketHash" ~ '^[0-9a-f]{64}$'
);
