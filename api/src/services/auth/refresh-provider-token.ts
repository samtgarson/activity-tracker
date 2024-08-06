import { Account } from "prisma/client"
import type { refreshTokenSchema } from "src/gateways/contracts/oauth"
import { OAuthGateway } from "src/gateways/oauth-gateway"
import { Provider } from "src/models/types"
import { z } from "zod"
import { Service, ServiceInput } from "../base"

export interface RefreshProviderTokenDeps {
  oauth: typeof OAuthGateway
}

export class RefreshProviderToken extends Service {
  constructor(
    ctx: ServiceInput,
    private deps: RefreshProviderTokenDeps = { oauth: OAuthGateway },
  ) {
    super(ctx)
  }

  async call(account: Account) {
    if (!account.expiresAt) return this.success(account)
    if (account.expiresAt > new Date()) return this.success(account)
    const gateway = new this.deps.oauth(this.ctx, account.provider as Provider)

    const refreshed = await gateway.refreshToken(account.refreshToken)
    if (!refreshed.success) return this.failure()

    const updatedAccount = await this.updateAccount(account.id, refreshed.data)
    return this.success(updatedAccount)
  }

  private async updateAccount(
    id: string,
    data: z.infer<typeof refreshTokenSchema>,
  ) {
    return this.db.account.update({
      where: { id },
      data,
    })
  }
}
