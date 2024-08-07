import { GoogleGateway } from "src/gateways/google-gateway"
import { GatewayErrors } from "src/gateways/types"
import { Provider } from "src/models/types"
import { Service, ServiceInput } from "../base"

export interface CalendarCreatorDeps {
  google: Pick<GoogleGateway, "createCalendar">
}

export class CalendarCreator extends Service<GatewayErrors> {
  constructor(
    ctx: ServiceInput,
    private deps: CalendarCreatorDeps = {
      google: new GoogleGateway(ctx),
    },
  ) {
    super(ctx)
  }

  async call(title: string) {
    const account = this.ctx.activeAccount
    if (!account?.accessToken) return this.failure("auth_failed")

    switch (account.provider) {
      case Provider.Google:
        return this.deps.google.createCalendar(account.accessToken, title)
    }
  }
}
