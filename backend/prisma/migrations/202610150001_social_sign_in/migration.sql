ALTER TYPE "RegistrationOperation" ADD VALUE 'SOCIAL_START';
ALTER TYPE "RegistrationOperation" ADD VALUE 'SOCIAL_COMPLETE';
CREATE TYPE "SocialProvider" AS ENUM ('GOOGLE', 'APPLE');
CREATE TYPE "SocialPlatform" AS ENUM ('IOS', 'ANDROID');
CREATE TABLE "SocialSignInFlow" (
  "id" UUID NOT NULL,
  "capabilityHash" CHAR(64) NOT NULL,
  "nonceHash" CHAR(64) NOT NULL,
  "provider" "SocialProvider" NOT NULL,
  "platform" "SocialPlatform" NOT NULL,
  "purpose" VARCHAR(16) NOT NULL DEFAULT 'SIGN_IN',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "consumedAt" TIMESTAMPTZ(3),
  CONSTRAINT "SocialSignInFlow_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SocialSignInFlow_binding" CHECK ("purpose" = 'SIGN_IN' AND ("provider" <> 'APPLE' OR "platform" = 'IOS')),
  CONSTRAINT "SocialSignInFlow_attempts" CHECK ("attempts" BETWEEN 0 AND 5),
  CONSTRAINT "SocialSignInFlow_lifetime" CHECK ("expiresAt" > "createdAt" AND "expiresAt" <= "createdAt" + INTERVAL '5 minutes'),
  CONSTRAINT "SocialSignInFlow_hashes" CHECK ("capabilityHash" ~ '^[a-f0-9]{64}$' AND "nonceHash" ~ '^[a-f0-9]{64}$')
);
CREATE UNIQUE INDEX "SocialSignInFlow_capabilityHash_key" ON "SocialSignInFlow"("capabilityHash");
CREATE INDEX "SocialSignInFlow_expiresAt_idx" ON "SocialSignInFlow"("expiresAt");
