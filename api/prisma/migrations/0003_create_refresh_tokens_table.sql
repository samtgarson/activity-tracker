-- Migration number: 0003 	 2024-08-04T20:25:19.990Z
-- CreateTable
CREATE TABLE "refresh_tokens" (
    "token" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "revoked_at" DATETIME,
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_accounts" ("access_token", "active", "calendar_id", "created_at", "expires_at", "id", "provider", "refresh_token", "remote_id", "scope", "token_type", "user_id") SELECT "access_token", "active", "calendar_id", "created_at", "expires_at", "id", "provider", "refresh_token", "remote_id", "scope", "token_type", "user_id" FROM "accounts";
DROP TABLE "accounts";
ALTER TABLE "new_accounts" RENAME TO "accounts";
CREATE UNIQUE INDEX "accounts_user_id_provider_key" ON "accounts"("user_id", "provider");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

