import { User } from "prisma/client"
import { pick } from "radash"

export function serializeUser(user: User) {
  return pick(user, [
    "id",
    "createdAt",
    "givenName",
    "familyName",
    "displayName",
    "picture",
  ])
}
