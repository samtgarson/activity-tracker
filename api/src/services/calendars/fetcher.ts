import { Account } from "prisma/client"
import { GoogleGateway } from "src/gateways/google-gateway"
import { GatewayErrors } from "src/gateways/types"
import { Provider } from "src/models/types"
import { Service, ServiceInput } from "src/services/base"

export interface CalendarFetcherDeps {
  google: Pick<GoogleGateway, "getCalendar">
}

export class CalendarFetcher extends Service<GatewayErrors> {
  constructor(
    ctx: ServiceInput,
    private deps: CalendarFetcherDeps = { google: new GoogleGateway(ctx) },
  ) {
    super(ctx)
  }

  async call(account: Account, calendarId: string) {
    if (!account?.accessToken) return this.success(null)

    switch (account.provider) {
      case Provider.Google:
        return this.deps.google.getCalendar(account.accessToken, calendarId)
    }
  }
}
