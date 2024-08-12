import { faker } from "@faker-js/faker"
import { User } from "prisma/client"
import { vi } from "vitest"

export const mockAccountFor = vi.fn()
export function buildUser(attrs: Partial<User> = {}) {
  const givenName = faker.person.firstName()
  const familyName = faker.person.lastName()

  return {
    id: faker.string.uuid(),
    displayName: `${givenName} ${familyName}`,
    givenName,
    familyName,
    picture: faker.image.avatar(),
    createdAt: faker.date.recent(),
    ...attrs,
  } satisfies User
}
