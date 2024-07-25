import { createUrl } from "src/services/util/url"
import { BaseGateway, GatewayOptions } from "./base-gateway"

export class GoogleGateway extends BaseGateway {
  async getProfile(token: string) {
    return this.callWithToken(
      token,
      "https://people.googleapis.com/v1/people/me",
    )
  }

  async getCalendarList(token: string) {
    return this.callWithToken(
      token,
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    )
  }

  async getCalendar(token: string, calendarId: string) {
    return this.callWithToken(
      token,
      `https://www.googleapis.com/calendar/v3/users/me/calendarList/${calendarId}`,
    )
  }

  async createCalendar(token: string, title: string) {
    return await this.callWithToken(
      token,
      "https://www.googleapis.com/calendar/v3/calendars",
      { method: "POST", json: { summary: title } },
    )
  }

  async addCalendarToList(
    token: string,
    calendarId: string,
    foregroundColor: string,
    backgroundColor: string,
  ) {
    const data = {
      id: calendarId,
      selected: true,
      backgroundColor,
      foregroundColor,
    }

    return await this.callWithToken(
      token,
      "https://www.googleapis.com/calendar/v3/users/me/calendarList?colorRgbFormat=true",
      { method: "POST", json: data },
    )
  }

  async getEvents(
    token: string,
    calendarId: string,
    { from, to }: { from?: Date; to?: Date } = {},
  ) {
    const params: Record<string, string> = {
      maxAttendees: "1",
      orderBy: "startTime",
      singleEvents: "true",
    }
    if (from) params["timeMin"] = from.toISOString()
    if (to) params["timeMax"] = to.toISOString()

    const url = createUrl(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      params,
    )
    return this.callWithToken(token, url)
  }

  async callWithToken(
    token: string,
    url: string | URL,
    options?: GatewayOptions,
  ) {
    return this.call(url, {
      ...options,
      headers: { ...options?.headers, Authorization: `Bearer ${token}` },
    })
  }
}
