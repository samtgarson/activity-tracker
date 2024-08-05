import { faker } from "@faker-js/faker"
import { RefreshToken } from "prisma/client"

export function buildRefreshToken(attrs: Partial<RefreshToken> = {}) {
  return {
    token: faker.string.uuid(),
    userId: faker.string.uuid(),
    expiresAt: faker.date.future(),
    revokedAt: null,
    ...attrs,
  } satisfies RefreshToken
}
