import { beforeEach } from "vitest"
import { mockDeep, mockReset } from "vitest-mock-extended"
import type { prisma as createPrismaClient } from "../client"

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = mockDeep<ReturnType<typeof createPrismaClient>>({
  funcPropSupport: true,
})
export const prisma = () => prismaMock
