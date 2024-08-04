import { GoogleGateway } from "src/gateways/google-gateway"
import { Provider } from "src/models/types"
import { Service, ServiceInput } from "../base"

export type FetchProfileDependencies = {
  google: Pick<GoogleGateway, "getProfile">
}

export class FetchProfile extends Service {
  constructor(
    ctx: ServiceInput,
    private deps: FetchProfileDependencies = { google: new GoogleGateway(ctx) },
  ) {
    super(ctx)
  }

  async call(provider: Provider, accessToken: string) {
    const res = await this.fetch(provider, accessToken)
    if (res.success) return this.success(res.data)
    return this.failure()
  }

  private async fetch(provider: Provider, accessToken: string) {
    switch (provider) {
      case Provider.Google:
        return this.deps.google.getProfile(accessToken)
    }
  }
}
