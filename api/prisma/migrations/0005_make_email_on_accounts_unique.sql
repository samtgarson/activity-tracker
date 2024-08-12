-- Migration number: 0005 	 2024-08-10T10:20:03.383Z
-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

