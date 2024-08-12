import { Account } from "prisma/client"
import { pick } from "radash"

export function serializeAccount(account: Account | null) {
  if (!account) return null
  return {
    id: account.email,
    ...pick(account, ["provider", "calendarId", "active", "createdAt"]),
  }
}
