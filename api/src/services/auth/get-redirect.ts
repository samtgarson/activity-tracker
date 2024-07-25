import { OAuthGateway } from "src/gateways/oauth-gateway"
import { Provider } from "src/models/types"
import { Service } from "../base"

export class AuthGetRedirect extends Service<string> {
  async call(provider: Provider, postRedirect?: string) {
    try {
      const redirect = await this.getRedirect(provider, postRedirect)
      return this.success(redirect.toString())
    } catch (e) {
      console.error(e)
      return this.failure()
    }
  }

  private async getRedirect(provider: Provider, postRedirect?: string) {
    const gateway = new OAuthGateway(this.ctx, provider)
    return await gateway.createAuthUrl(postRedirect)
  }
}
