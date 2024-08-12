import { User } from "prisma/client"
import { pick } from "radash"

export function serializeUser(account: User | null) {
  if (!account) return null
  return pick(account, [
    "id",
    "createdAt",
    "givenName",
    "familyName",
    "displayName",
    "picture",
  ])
}
