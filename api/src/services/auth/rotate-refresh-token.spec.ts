import { prismaMock } from "prisma/__mocks__/client"
import { buildRefreshToken } from "spec/factories/refresh-token-factory"
import { mockContext } from "spec/util"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  AuthRotateRefreshToken,
  AuthRotateRefreshTokenDeps,
} from "./rotate-refresh-token"

vi.mock("prisma/client")

const deps = {
  generate: vi.fn(),
} satisfies AuthRotateRefreshTokenDeps
const svc = new AuthRotateRefreshToken(mockContext, deps)

describe("when the old token cannot be found", () => {
  beforeEach(() => {
    prismaMock.refreshToken.delete.mockRejectedValue(new Error("not found"))
  })

  it("returns a failure", async () => {
    const result = await svc.call("token")
    expect(result).toEqual({
      success: false,
      code: "server_error",
      data: undefined,
    })
  })

  describe("when the old token is found", () => {
    const newToken = { token: "new-token", expiresAt: new Date() }
    beforeEach(() => {
      prismaMock.refreshToken.delete.mockResolvedValue(buildRefreshToken())
      deps.generate.mockReturnValue(newToken)
    })

    it("deletes the old token from the database", async () => {
      await svc.call("token")
      expect(prismaMock.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: "token", userId: mockContext.user.id },
      })
    })

    it("generates a new token", async () => {
      await svc.call("token")
      expect(deps.generate).toHaveBeenCalled()
    })

    it("creates a new token in the database", async () => {
      await svc.call("token")
      expect(prismaMock.refreshToken.create).toHaveBeenCalledWith({
        data: {
          ...newToken,
          user: { connect: { id: mockContext.user.id } },
        },
      })
    })

    it("returns the new token", async () => {
      const result = await svc.call("token")
      expect(result).toEqual({ success: true, data: newToken })
    })
  })
})
