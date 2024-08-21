import { Account, User } from "prisma/client"
import { pick } from "radash"
import { userSchema } from "src/models/schemas"
import { z } from "zod"
import { serializeAccount } from "./account-serializer"

const publicUserKeys: Array<keyof User> = [
  "id",
  "createdAt",
  "givenName",
  "familyName",
  "displayName",
  "picture",
]

export function serializeUser(
  user: User,
  accounts: Account[] = [],
): z.infer<typeof userSchema> {
  return {
    ...pick(user, publicUserKeys),
    accounts: accounts.map(serializeAccount),
  }
}
