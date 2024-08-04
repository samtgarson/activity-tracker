import { OAuthGateway } from "src/gateways/oauth-gateway"
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
  async call(postRedirect?: string) {
    try {
      const redirect = await this.getRedirect(postRedirect)
      return this.success(redirect.toString())
    } catch (e) {
      console.error(e)
      return this.failure()
    }
  }

  private async getRedirect(postRedirect?: string) {
    return await this.gateway.createAuthUrl(postRedirect)
  }
}
