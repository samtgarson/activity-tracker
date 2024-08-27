import { OAuthGateway, OAuthStateParams } from "src/gateways/oauth-gateway"
import { Provider } from "src/models/types"
import { Service, ServiceInput } from "../base"

type RedirectUrlProvider = Pick<OAuthGateway, "createAuthUrl">

export class AuthGetRedirect extends Service {
  constructor(
    ctx: ServiceInput,
    provider: Provider,
    private gateway: RedirectUrlProvider = new OAuthGateway(ctx, provider),
  ) {
    super(ctx)
  }
  async call(postRedirect?: string, userId?: string) {
    try {
      const state: OAuthStateParams = { redirect: postRedirect, userId }
      const redirect = await this.gateway.createAuthUrl(state)
      return this.success(redirect.toString())
    } catch (e) {
      console.error(e)
      return this.failure()
    }
  }
}
