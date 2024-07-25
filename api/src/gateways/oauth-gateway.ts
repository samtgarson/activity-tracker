import { sign } from "hono/jwt"
import { Provider } from "src/models/types"
import { InputRequest } from "src/services/base"
import { createUrl, mergeParams } from "src/services/util/url"
import { BaseGateway } from "./base-gateway"

type OAuthGatewayConfig = {
  authUrl: string
  tokenUrl: string
  clientId: string
  clientSecret: string
  authParams?: Record<string, string>
}

export type ConfigProvider = (
  ctx: InputRequest,
  provider: Provider,
) => OAuthGatewayConfig

export class OAuthGateway extends BaseGateway {
  constructor(
    ctx: InputRequest,
    private provider: Provider,
    fetch = global.fetch,
    private configProvider: ConfigProvider = defaultConfigProvider,
    // private authClient: AccessTokenFetcher = new GoogleAccessTokenFetcher()
  ) {
    super(ctx, fetch)
  }

  async createAuthUrl(redirectUri?: string) {
    return createUrl(this.config.authUrl, {
      client_id: this.config.clientId,
      redirect_uri: this.redirectUrl,
      response_type: "code",
      state: await this.signState(redirectUri),
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
    })
  }

  private signState(redirect?: string) {
    return sign(
      { origin: "activity-tracker", redirect },
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

const defaultConfigProvider = (ctx: InputRequest, provider: Provider) =>
  ({
    [Provider.Google]: {
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      clientId: ctx.env.GOOGLE_CLIENT_ID,
      clientSecret: ctx.env.GOOGLE_CLIENT_SECRET,
      authParams: {
        scope: "https://www.googleapis.com/auth/userinfo.profile",
        access_type: "offline",
      },
    },
  })[provider]
