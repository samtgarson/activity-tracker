import { User } from "prisma/client"
import { GoogleGateway } from "src/gateways/google-gateway"
import { GatewayErrors } from "src/gateways/types"
import { Provider } from "src/models/types"
import { Service, ServiceInput } from "src/services/base"

export type CalendarListFetcherDeps = {
  google: Pick<GoogleGateway, "getCalendarList">
}

export class CalendarListFetcher extends Service<GatewayErrors> {
  constructor(
    ctx: ServiceInput,
    private deps: CalendarListFetcherDeps = { google: new GoogleGateway(ctx) },
  ) {
    super(ctx)
  }

  async call(user: User) {
    const account = await user.activeAccount
    if (!account?.accessToken) return this.success([])

    switch (account.provider as Provider) {
      case Provider.Google:
        return this.deps.google.getCalendarList(account.accessToken)
    }
  }
}
