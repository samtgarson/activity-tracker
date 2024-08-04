import { mockContext } from "spec/util"
import { Provider } from "src/models/types"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthGetRedirect } from "./get-redirect"

vi.mock("hono/jwt", () => ({
  sign: vi.fn(() => "signed-state"),
}))

const redirectUrlProvider = {
  createAuthUrl: vi.fn(async () => new URL("http://google.com")),
}
const service = new AuthGetRedirect(
  mockContext,
  Provider.Google,
  redirectUrlProvider,
)

describe("With Google provider", () => {
  it("returns a redirect", async () => {
    const redirect = await service.call()
    expect(redirect.success).toBe(true)
    expect(redirect.data).toBe("http://google.com/")
  })

  describe("with post-redirect", () => {
    it("calls the gateway with the correct param", async () => {
      const postRedirect = "http://localhost:8787/auth/login/google"
      await service.call(postRedirect)
      expect(redirectUrlProvider.createAuthUrl).toHaveBeenCalledWith(
        postRedirect,
      )
    })
  })

  describe("when gateway throws an error", () => {
    beforeEach(() => {
      redirectUrlProvider.createAuthUrl.mockRejectedValue(new Error("Failed"))
    })

    it("returns a failure", async () => {
      const redirect = await service.call()

      expect(redirect.success).toBe(false)
    })
  })
})
