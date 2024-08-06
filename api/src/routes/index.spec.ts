import { buildAccount } from "spec/factories/account-factory"
import { buildUser } from "spec/factories/user-factory"
import { mockContext } from "spec/util"
import { AuthDecodeToken } from "src/services/auth/decode-token"
import { RefreshProviderToken } from "src/services/auth/refresh-provider-token"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { app } from "."

vi.mock("src/services/auth/decode-token", async () => ({
  AuthDecodeToken: vi.fn().mockReturnValue({
    call: vi.fn().mockReturnValue({
      success: true,
      data: null,
    }),
  }),
}))

vi.mock("src/services/auth/refresh-provider-token", async () => ({
  RefreshProviderToken: vi.fn().mockReturnValue({
    call: vi.fn().mockReturnValue({
      success: true,
      data: null,
    }),
  }),
}))

describe("GET /", () => {
  it("should return a message", async () => {
    const response = await app.request("/")
    expect(await response.json()).toEqual({ message: "beep boop" })
  })
})

describe("GET /me", () => {
  describe("when user is not authorized", () => {
    beforeEach(() => {
      vi.mocked(new AuthDecodeToken(mockContext)).call.mockResolvedValue({
        success: false,
        code: "server_error",
        data: null as never,
      })
    })

    it("should return an error", async () => {
      const response = await app.request("/me")
      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({ error: "Not authorized" })
    })

    it("should not call the refresh service", async () => {
      await app.request("/me")
      expect(
        vi.mocked(new RefreshProviderToken(mockContext)).call,
      ).not.toHaveBeenCalled()
    })

    it("should authenticate the user", async () => {
      await app.request("/me")
      expect(
        vi.mocked(new AuthDecodeToken(mockContext)).call,
      ).toHaveBeenCalledWith(undefined)
    })
  })

  describe("when user is authorized", () => {
    const account = buildAccount()
    const user = buildUser({ activeAccount: Promise.resolve(account) })

    beforeEach(() => {
      vi.mocked(new AuthDecodeToken(mockContext)).call.mockResolvedValue({
        success: true,
        data: user,
      })
    })

    it("should refresh the token", async () => {
      await app.request("/me")
      expect(
        vi.mocked(new RefreshProviderToken(mockContext)).call,
      ).toHaveBeenCalledWith(account)
    })

    describe("when the token cannot be refreshed", () => {
      beforeEach(() => {
        vi.mocked(
          new RefreshProviderToken(mockContext),
        ).call.mockResolvedValueOnce({
          success: false,
          code: "server_error",
          data: null as never,
        })
      })

      it("should return an error", async () => {
        const response = await app.request("/me")
        expect(response.status).toBe(500)
        expect(await response.json()).toEqual({
          error: "Failed to refresh token for active account",
        })
      })
    })

    describe("when the token is refreshed", () => {
      beforeEach(() => {
        vi.mocked(
          new RefreshProviderToken(mockContext),
        ).call.mockResolvedValueOnce({ success: true, data: account })
      })

      it("should return the user and active account", async () => {
        const response = await app.request("/me")
        const { accountFor, activeAccount, ...userJson } = user

        expect(response.status).toBe(200)
        expect(await response.json()).toEqual({
          ...userJson,
          createdAt: user.createdAt.toISOString(),
          activeProvider: account.provider,
        })
      })
    })
  })
})
