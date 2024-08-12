-- Migration number: 0005 	 2024-08-10T10:12:19.003Z
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "remote_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "access_token" TEXT,
    "expires_at" DATETIME,
    "token_type" TEXT,
    "scope" TEXT,
    "refresh_token" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calendar_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_accounts" ("access_token", "active", "calendar_id", "created_at", "expires_at", "id", "provider", "refresh_token", "remote_id", "scope", "token_type", "user_id") SELECT "access_token", "active", "calendar_id", "created_at", "expires_at", "id", "provider", "refresh_token", "remote_id", "scope", "token_type", "user_id" FROM "accounts";
DROP TABLE "accounts";
ALTER TABLE "new_accounts" RENAME TO "accounts";
CREATE UNIQUE INDEX "accounts_user_id_provider_key" ON "accounts"("user_id", "provider");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "display_name" TEXT NOT NULL,
    "family_name" TEXT NOT NULL,
    "given_name" TEXT NOT NULL,
    "picture" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_users" ("created_at", "display_name", "family_name", "given_name", "id", "picture") SELECT "created_at", "display_name", "family_name", "given_name", "id", "picture" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

