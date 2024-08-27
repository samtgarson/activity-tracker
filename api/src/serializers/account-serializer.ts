import { Account } from "prisma/client"
import { pick } from "radash"
import { accountSchema } from "src/models/schemas"
import { z } from "zod"

export function serializeAccount(
  account: Account,
): z.infer<typeof accountSchema> {
  return pick(account, [
    "id",
    "provider",
    "calendarId",
    "active",
    "createdAt",
    "email",
  ])
}
