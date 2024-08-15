import { User } from "prisma/client"
import { pick } from "radash"
import { userSchema } from "src/models/schemas"
import { z } from "zod"

export function serializeUser(user: User): z.infer<typeof userSchema> {
  return pick(user, [
    "id",
    "createdAt",
    "givenName",
    "familyName",
    "displayName",
    "picture",
  ])
}
