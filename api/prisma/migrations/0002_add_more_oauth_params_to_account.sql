-- AlterTable
ALTER TABLE "accounts" ADD COLUMN "access_token" TEXT;
ALTER TABLE "accounts" ADD COLUMN "expires_at" INTEGER;
ALTER TABLE "accounts" ADD COLUMN "scope" TEXT;
ALTER TABLE "accounts" ADD COLUMN "token_type" TEXT;

