import dayjs, { Dayjs } from "dayjs"
import { Account } from "prisma/client"
import { GoogleGateway } from "src/gateways/google-gateway"
import { GatewayErrors } from "src/gateways/types"
import { Provider } from "src/models/types"
import { Service, ServiceInput } from "src/services/base"

export interface EventListFetcherDeps {
  google: Pick<GoogleGateway, "getEvents">
}

export class EventListFetcher extends Service<GatewayErrors> {
  constructor(
    ctx: ServiceInput,
    private deps: EventListFetcherDeps = { google: new GoogleGateway(ctx) },
  ) {
    super(ctx)
  }

  async call(account: Account, filters?: { from?: Dayjs; to?: Dayjs }) {
    if (!account?.accessToken || !account.calendarId) return this.success([])

    switch (account.provider) {
      case Provider.Google:
        return this.deps.google.getEvents(
          account.accessToken,
          account.calendarId,
          this.processFilters(filters),
        )
    }
  }

  private processFilters(filters: { from?: Dayjs; to?: Dayjs } = {}): {
    from: Dayjs
    to: Dayjs
  } {
    if (filters.from && filters.to)
      return { from: filters.from.startOf("day"), to: filters.to.endOf("day") }
    const day = filters.from || filters.to || dayjs()

    return { from: day.startOf("day"), to: day.endOf("day") }
  }
}
