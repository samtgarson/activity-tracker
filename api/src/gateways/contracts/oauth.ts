import { Prisma } from "prisma/client"
import { z } from "zod"
import { camelize } from "."

const oauthSchema = z.object({
  accessToken: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
  refreshToken: z.string(),
  scope: z.string(),
})

export const createTokenSchema = camelize(
  oauthSchema.transform(transformExpiresInToExpiresAt),
)
export const refreshTokenSchema = camelize(
  oauthSchema
    .omit({ refreshToken: true })
    .transform(transformExpiresInToExpiresAt),
)

export const oAuthCallbackParamsSchema = z.object({
  state: z.string(),
  code: z.string(),
})

export const oAuthStateSchema = z.object({
  origin: z.literal("activity-tracker"),
  redirect: z.string().optional(),
})

export type OAuthToken = z.infer<typeof createTokenSchema>

export const accessTokenSchema = z.object({
  sub: z.string().uuid(),
  exp: z.number().transform((n) => new Date(n * 1000)),
  givenName: z.string(),
  familyName: z.string(),
  picture: z.string().url().nullish(),
})

function transformExpiresInToExpiresAt<Input>({
  expiresIn,
  ...data
}: Input & { expiresIn: number }) {
  return {
    ...data,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
  } satisfies Pick<
    Prisma.AccountUpdateInput,
    "accessToken" | "refreshToken" | "expiresAt" | "scope" | "tokenType"
  >
}
