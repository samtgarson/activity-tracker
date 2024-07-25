import { InputRequest, Service } from "src/services/base"
import { GatewayErrors } from "./types"

export interface GatewayOptions extends RequestInit {
  json?: Record<string, unknown>
}

export class BaseGateway extends Service<unknown, GatewayErrors> {
  constructor(
    ctx: InputRequest,
    protected fetch = global.fetch,
    // private authClient: AccessTokenFetcher = new GoogleAccessTokenFetcher()
  ) {
    super(ctx)
  }

  async call(url: string | URL, { json, ...options }: GatewayOptions = {}) {
    try {
      const res = await this.fetch(url, {
        ...options,
        body: json ? JSON.stringify(json) : options?.body,
      })

      if (!res.ok) {
        return this.failure("request_failed", res)
      }

      const data = await res.json()
      return this.success(data)
    } catch (e) {
      console.error(e)
      return this.failure("server_error", e)
    }
  }
}
