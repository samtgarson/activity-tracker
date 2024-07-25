import { describe, expect, test, vi } from "vitest"
import { AuthGetRedirect } from "./get-redirect"
import { Provider } from "src/models/types"
import { Config } from "src/types/config"
import { sign } from "hono/jwt"

vi.mock("hono/jwt", () => ({
  sign: vi.fn(() => "signed-state"),
}))

describe("With Google provider", () => {
  const env: Config = {
    GOOGLE_CLIENT_ID: "google-client-id",
    GOOGLE_CLIENT_SECRET: "google-client-secret",
    JWT_SECRET: "jwt-secret",
  }

  test("returns a redirect", async () => {
    const url = "http://localhost:8787/auth/login/google"
    const service = new AuthGetRedirect({ env, req: { url } })
    const redirect = await service.call(Provider.Google)
    const search = {
      access_type: "offline",
      scope: "https://www.googleapis.com/auth/userinfo.profile",
      response_type: "code",
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: "http://localhost:8787/auth/callback/google",
      state: "signed-state",
    }

    expect(redirect.success).toBe(true)
    const redirectUrl = new URL(redirect.data)
    expect(
      Object.fromEntries(redirectUrl.searchParams.entries()),
    ).toMatchObject(search)
    expect(sign).toHaveBeenCalledWith(
      { origin: "activity-tracker" },
      env.JWT_SECRET,
    )
  })

  test("returns a redirect with a post-redirect", async () => {
    const url = "http://localhost:8787/auth/login/google"
    const service = new AuthGetRedirect({ env, req: { url } })
    const redirect = await service.call(Provider.Google, "/post-redirect")

    expect(redirect.success).toBe(true)
    expect(sign).toHaveBeenCalledWith(
      { origin: "activity-tracker", redirect: "/post-redirect" },
      env.JWT_SECRET,
    )
  })
})
