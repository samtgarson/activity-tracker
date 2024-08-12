import { faker } from "@faker-js/faker"
import { Account, User } from "prisma/client"
import { Provider } from "src/models/types"
import { buildUser } from "./user-factory"

export function buildAccount(attrs: Partial<Account> = {}, user?: User) {
  user ||= buildUser()

  return {
    id: faker.string.uuid(),
    scope: faker.lorem.words(),
    provider: faker.helpers.enumValue(Provider),
    active: faker.datatype.boolean(),
    userId: user.id,
    remoteId: faker.string.uuid(),
    createdAt: faker.date.recent(),
    expiresAt: faker.date.soon(),
    tokenType: "Bearer",
    accessToken: faker.string.alpha(32),
    refreshToken: faker.string.alpha(32),
    calendarId: faker.string.uuid(),
    email: faker.internet.email(),
    ...attrs,
  } satisfies Account
}
