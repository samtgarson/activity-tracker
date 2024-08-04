import { buildUser } from "spec/factories/user-factory"
import { mockContext } from "spec/util"
import { Provider } from "src/models/types"
import { AuthGetRedirect } from "src/services/auth/get-redirect"
import { AuthHandleCallback } from "src/services/auth/handle-callback"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthRouter } from "./auth"

vi.mock("src/services/auth/tokens", async () => {
  return {
    generateAccessToken: vi.fn().mockResolvedValue("access-token"),
    generateRefreshToken: vi.fn().mockResolvedValue("refresh-token"),
  }
})

vi.mock("src/services/auth/get-redirect", async () => {
  return {
    AuthGetRedirect: vi.fn().mockReturnValue({
      call: vi.fn().mockReturnValue({ success: true, data: "google-auth-url" }),
    }),
  }
})

vi.mock("src/services/auth/handle-callback", async (importOriginal) => {
  const mod =
    await importOriginal<typeof import("src/services/auth/handle-callback")>()
  return {
    ...mod,
    AuthHandleCallback: vi.fn().mockReturnValue({
      call: vi.fn().mockReturnValue({
        success: true,
        data: {
          user: buildUser(),
        },
      }),
    }),
  }
})

describe("GET /login/google", () => {
  describe("with valid provider", async () => {
    it("returns a redirect", async () => {
      const res = await AuthRouter.request("/login/google")
      expect(res.status).toBe(302)
      expect(res.headers.get("location")).toBe("google-auth-url")
    })
  })

  describe("with invalid provider", async () => {
    it("returns a 400", async () => {
      const res = await AuthRouter.request("/login/invalid")
      expect(res.status).toBe(400)
    })
  })

  describe("when the service fails", () => {
    it("returns error", async () => {
      vi.mocked(
        new AuthGetRedirect(mockContext, Provider.Google).call,
      ).mockResolvedValue({
        success: false,
        code: "server_error" as const,
        data: null as never,
      })
      const res = await AuthRouter.request("/login/google")
      expect(res.status).toBe(500)
    })
  })
})

describe("GET /callback/google", () => {
  describe("without valid query params", () => {
    it("returns a 400", async () => {
      const res = await AuthRouter.request("/callback/google?invalid=param")
      expect(res.status).toBe(400)
    })
  })

  describe("with invalid provider", async () => {
    it("returns a 400", async () => {
      const res = await AuthRouter.request("/callback/invalid")
      expect(res.status).toBe(400)
    })
  })

  describe("with valid query params", async () => {
    const args = [
      "/callback/google?code=code&state=state",
      undefined,
      mockContext,
    ] as const

    describe("when the service succeeds", () => {
      it("returns a 200", async () => {
        const res = await AuthRouter.request(...args)
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({
          accessToken: "access-token",
          refreshToken: "refresh-token",
        })
      })

      it("calls the service with the correct params", async () => {
        await AuthRouter.request(...args)
        expect(
          new AuthHandleCallback(mockContext, Provider.Google).call,
        ).toHaveBeenCalledWith({ code: "code", state: "state" })
      })
    })

    describe("when the service fails", () => {
      beforeEach(() => {
        vi.mocked(
          new AuthHandleCallback(mockContext, Provider.Google).call,
        ).mockResolvedValue({
          success: false,
          code: "server_error" as const,
          data: null as never,
        })
      })

      it("returns error", async () => {
        const res = await AuthRouter.request(...args)
        expect(res.status).toBe(500)
        expect(await res.json()).toEqual({ error: "server_error", data: null })
      })
    })
  })
})
