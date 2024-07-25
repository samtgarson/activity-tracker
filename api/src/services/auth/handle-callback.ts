import { verify } from "hono/jwt"
import { Provider } from "src/models/types"
import { z } from "zod"
import { Service } from "../base"
import { mergeParams } from "../util/url"

export const oAuthCallbackSchema = z.object({
  state: z.string(),
  code: z.string(),
})

const stateSchema = z.object({
  origin: z.literal("activity-tracker"),
  redirect: z.string().optional(),
})

const responseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
})
type OAuthResponse = z.infer<typeof responseSchema>

export type OAuthCallbackSchema = z.infer<typeof oAuthCallbackSchema>

export class AuthHandleCallback extends Service<{
  redirect?: string
  data: OAuthResponse
}> {
  async call(provider: Provider, { state, code }: OAuthCallbackSchema) {
    const { redirect } = await this.validateState(state)

    const { ok, data } = await this.exchangeCode(provider, code)
    if (ok) return this.success({ redirect, data })
    return this.failure()
  }

  private async validateState(state: string) {
    const decoded = await verify(state, this.ctx.env.JWT_SECRET)
    return stateSchema.parse(decoded)
  }

  private async exchangeCode(
    provider: Provider,
    code: string,
  ): Promise<{ ok: true; data: OAuthResponse } | { ok: false; data?: never }> {
    const { base, params } = this.authCodeParams(provider)
    const res = await fetch(base, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: mergeParams(this.defaultParams(provider), params, { code }),
    })

    if (res.ok)
      return { ok: true, data: responseSchema.parse(await res.json()) }

    console.error(await res.text())
    return { ok: false }
  }

  private authCodeParams(provider: Provider) {
    switch (provider) {
      case Provider.Google:
        return {
          base: "https://oauth2.googleapis.com/token",
          params: {
            client_id: this.ctx.env.GOOGLE_CLIENT_ID,
            client_secret: this.ctx.env.GOOGLE_CLIENT_SECRET,
          },
        }
    }
  }

  private defaultParams(provider: Provider) {
    return {
      redirect_uri: `${this.ctx.url.origin}/auth/callback/${provider}`,
      grant_type: "authorization_code",
    }
  }
}
