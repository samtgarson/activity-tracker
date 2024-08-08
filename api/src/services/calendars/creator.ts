import { GoogleGateway } from "src/gateways/google-gateway"
import { GatewayErrors } from "src/gateways/types"
import { Provider } from "src/models/types"
import { Service, ServiceInput } from "../base"

export interface CalendarCreatorDeps {
  google: Pick<GoogleGateway, "createCalendar" | "addCalendarToList">
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

    const created = await this.createCalendar(
      account.provider,
      account.accessToken,
      title,
    )
    if (!created.success) return created

    const inserted = await this.insertCalendar(
      account.provider,
      account.accessToken,
      created.data.id,
    )
    if (!inserted.success) return inserted

    return this.success(inserted.data)
  }

  private async createCalendar(
    provider: Provider,
    accessToken: string,
    title: string,
  ) {
    switch (provider) {
      case Provider.Google:
        return this.deps.google.createCalendar(accessToken, title)
    }
  }

  private async insertCalendar(
    provider: Provider,
    accessToken: string,
    calendarId: string,
  ) {
    const foregroundColor = "#000000"
    const backgroundColor = "#FFB5B4"

    switch (provider) {
      case Provider.Google:
        return this.deps.google.addCalendarToList(
          accessToken,
          calendarId,
          foregroundColor,
          backgroundColor,
        )
    }
  }
}
