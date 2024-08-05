import { sign, verify } from "hono/jwt"
import { buildUser } from "spec/factories/user-factory"
import type { accessTokenSchema } from "src/gateways/contracts/oauth"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"
import {
  decodeAccessToken,
  generateAccessToken,
  generateRefreshToken,
} from "./tokens"

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

describe("decodeAccessToken", () => {
  describe("when JWT is valid", () => {
    const payload = {
      sub: crypto.randomUUID(),
      email: "email@example.com",
      exp: Date.now(),
      givenName: "John",
      familyName: "Doe",
    } satisfies z.input<typeof accessTokenSchema>

    beforeEach(() => {
      vi.mocked(verify).mockResolvedValue(payload)
    })

    it("returns the payload", async () => {
      expect(await decodeAccessToken("token", "secret")).toEqual({
        ...payload,
        exp: new Date(payload.exp * 1000),
      })
    })
  })

  describe("when JWT is invalid", () => {
    const error = "Invalid token"
    beforeEach(() => {
      vi.mocked(verify).mockRejectedValue(new Error(error))
    })

    it("throws an error", async () => {
      await expect(() =>
        decodeAccessToken("token", "secret"),
      ).rejects.toThrowError(error)
    })
  })

  describe("when JWT is valid but payload is invalid", () => {
    const payload = { sub: "sub" }

    beforeEach(() => {
      vi.mocked(verify).mockResolvedValue(payload)
    })

    it("throws an error", async () => {
      await expect(() =>
        decodeAccessToken("token", "secret"),
      ).rejects.toThrowError()
    })
  })
})
