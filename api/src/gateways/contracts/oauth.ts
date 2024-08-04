import { z } from "zod"
import { camelize } from "."

const oauthSchema = z.object({
  accessToken: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
  refreshToken: z.string(),
  scope: z.string(),
})

export const createTokenSchema = camelize(oauthSchema)
export const refreshTokenSchema = camelize(
  oauthSchema.omit({ refreshToken: true }),
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
