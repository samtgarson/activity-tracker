import { sign, verify } from "hono/jwt"
import { User } from "prisma/client"
import { accessTokenSchema } from "src/gateways/contracts/oauth"
import { z } from "zod"

export function generateRefreshToken() {
  const token = crypto.getRandomValues(new Uint8Array(32)).join("")
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  return { token, expiresAt }
}

export async function generateAccessToken(
  user: Pick<User, "id" | "email" | "givenName" | "familyName" | "picture">,
  secret: string,
) {
  const payload = {
    sub: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from now
    email: user.email,
    givenName: user.givenName,
    familyName: user.familyName,
    picture: user.picture,
  } satisfies z.input<typeof accessTokenSchema>

  return sign(payload, secret)
}

export async function decodeAccessToken(token: string, secret: string) {
  return accessTokenSchema.parse(await verify(token, secret))
}
