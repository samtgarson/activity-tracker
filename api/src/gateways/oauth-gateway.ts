import { sign } from "hono/jwt"
import { Provider } from "src/models/types"
import { ServiceInput } from "src/services/base"
import { createUrl, mergeParams } from "src/services/util/url"
import { z } from "zod"
import { BaseGateway } from "./base-gateway"
import {
  createTokenSchema,
  oAuthStateSchema,
  refreshTokenSchema,
} from "./contracts/oauth"

type OAuthGatewayConfig = {
  authUrl: string
  tokenUrl: string
  clientId: string
  clientSecret: string
  authParams?: Record<string, string>
}

export type ConfigProvider = (
  ctx: ServiceInput,
  provider: Provider,
) => OAuthGatewayConfig

export type OAuthStateParams = Omit<z.infer<typeof oAuthStateSchema>, "origin">

export class OAuthGateway extends BaseGateway {
  constructor(
    ctx: ServiceInput,
    private provider: Provider,
    fetch = undefined,
    private configProvider: ConfigProvider = defaultConfigProvider,
  ) {
    super(ctx, fetch)
  }

  async createAuthUrl(state?: OAuthStateParams) {
    return createUrl(this.config.authUrl, {
      client_id: this.config.clientId,
      redirect_uri: this.redirectUrl,
      response_type: "code",
      state: await this.signState(state),
      ...this.config.authParams,
    })
  }

  async exchangeCode(code: string) {
    return this.call(new URL("/token", this.config.tokenUrl), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: mergeParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.redirectUrl,
        grant_type: "authorization_code",
      }),
      schema: createTokenSchema,
    })
  }

  async refreshToken(refreshToken: string) {
    return this.call(new URL("/token", this.config.tokenUrl), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: mergeParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      schema: refreshTokenSchema,
    })
  }

  private signState(state?: OAuthStateParams) {
    return sign(
      { origin: "activity-tracker", ...state },
      this.ctx.env.JWT_SECRET,
    )
  }

  private get config(): OAuthGatewayConfig {
    return this.configProvider(this.ctx, this.provider)
  }

  private get redirectUrl() {
    return `${this.ctx.url.origin}/auth/callback/${this.provider}`
  }
}

const defaultConfigProvider = (ctx: ServiceInput, provider: Provider) =>
  ({
    [Provider.Google]: {
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      clientId: ctx.env.GOOGLE_CLIENT_ID,
      clientSecret: ctx.env.GOOGLE_CLIENT_SECRET,
      authParams: {
        scope: "profile email https://www.googleapis.com/auth/calendar",
        access_type: "offline",
      },
    },
  })[provider]
