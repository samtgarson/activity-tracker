import { sign } from "hono/jwt"
import { buildUser } from "spec/factories/user-factory"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { generateAccessToken, generateRefreshToken } from "./tokens"

vi.mock("hono/jwt")

describe("generateRefreshToken", () => {
  beforeEach(() => {
    vi.spyOn(crypto, "getRandomValues").mockReturnValue(new Uint8Array(32))
    vi.spyOn(Date, "now").mockReturnValue(0)
  })

  it("returns a token and an expiration date", () => {
    const { token, expiresAt } = generateRefreshToken()
    expect(token).toBe(crypto.getRandomValues(new Uint8Array(32)).join(""))
    expect(expiresAt).toEqual(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  })
})

describe("generateAccessToken", () => {
  const user = buildUser()
  const secret = "secret"
  beforeEach(() => {
    vi.mocked(sign).mockResolvedValue("token")
  })

  it("returns a token", async () => {
    expect(await generateAccessToken(user, secret)).toEqual("token")
  })

  it("calls sign with the correct payload", async () => {
    await generateAccessToken(user, secret)
    expect(sign).toHaveBeenCalledWith(
      {
        sub: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 15,
        email: user.email,
        givenName: user.givenName,
        familyName: user.familyName,
        picture: user.picture,
      },
      secret,
    )
  })
})
