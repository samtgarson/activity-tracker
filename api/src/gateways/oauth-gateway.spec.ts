import { sign } from "hono/jwt"
import { mockContext } from "spec/util"
import { Provider } from "src/models/types"
import { describe, expect, it, vi } from "vitest"
import { ZodSchema } from "zod"
import { ConfigProvider, OAuthGateway } from "./oauth-gateway"

vi.mock("hono/jwt", () => ({ sign: vi.fn(async () => "signed") }))

const mockFetch = vi.fn()
const config = {
  authUrl: "http://authurl.com",
  tokenUrl: "http://tokenurl.com",
  clientId: "clientId",
  clientSecret: "clientSecret",
  authParams: {
    param1: "value1",
    param2: "value2",
  },
}
const configProvider = vi.fn<ConfigProvider>(() => config)

const gateway = new OAuthGateway(
  mockContext,
  Provider.Google,
  // @ts-expect-error TODO: figure out why this is bugging
  mockFetch,
  configProvider,
)
const response = { ok: true }
vi.spyOn(gateway, "call").mockImplementation(async function (
  this: OAuthGateway,
) {
  return this.success(response)
})

describe("createUrl", () => {
  it("should return the correct URL", async () => {
    const url = await gateway.createAuthUrl()

    expect(url.protocol).toBe("http:")
    expect(url.host).toBe("authurl.com")
    expect(url.searchParams.get("client_id")).toBe(config.clientId)
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost/auth/callback/google",
    )
    expect(url.searchParams.get("param1")).toBe("value1")
    expect(url.searchParams.get("param2")).toBe("value2")
    expect(url.searchParams.get("state")).toBe("signed")
  })

  describe("when redirect is provided", () => {
    it("should sign the correct state", async () => {
      await gateway.createAuthUrl()
      expect(sign).toHaveBeenCalledWith(
        {
          origin: "activity-tracker",
        },
        mockContext.env.JWT_SECRET,
      )
    })
  })

  describe("when redirect is provided", () => {
    it("should sign the correct state", async () => {
      await gateway.createAuthUrl({ redirect: "http://redirect.com" })
      expect(sign).toHaveBeenCalledWith(
        {
          origin: "activity-tracker",
          redirect: "http://redirect.com",
        },
        mockContext.env.JWT_SECRET,
      )
    })

    describe("and userId is provided", () => {
      it("should sign the correct state", async () => {
        await gateway.createAuthUrl({
          redirect: "http://redirect.com",
          userId: "userId",
        })
        expect(sign).toHaveBeenCalledWith(
          {
            origin: "activity-tracker",
            redirect: "http://redirect.com",
            userId: "userId",
          },
          mockContext.env.JWT_SECRET,
        )
      })
    })
  })
})

describe("exchangeCode", () => {
  it("should call request with the correct params", async () => {
    const code = "code"
    await gateway.exchangeCode(code)
    expect(gateway.call).toHaveBeenCalledWith(
      new URL("/token", config.tokenUrl),
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          redirect_uri: "http://localhost/auth/callback/google",
          grant_type: "authorization_code",
        }),
        schema: expect.any(ZodSchema),
      },
    )
  })
})

describe("refreshToken", () => {
  it("should call request with the correct params", async () => {
    const refreshToken = "refreshToken"
    await gateway.refreshToken(refreshToken)
    expect(gateway.call).toHaveBeenCalledWith(
      new URL("/token", config.tokenUrl),
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
        schema: expect.any(ZodSchema),
      },
    )
  })
})
