import { Dayjs } from "dayjs"
import { createUrl } from "src/services/util/url"
import { z } from "zod"
import { BaseGateway, GatewayOptions } from "./base-gateway"
import { idObjectSchema } from "./contracts"
import {
  googleCalendarListSchema,
  googleCalendarSchema,
  googleEventListSchema,
  googleProfileSchema,
} from "./contracts/google"

export class GoogleGateway extends BaseGateway {
  async getProfile(token: string) {
    return this.callWithToken(
      token,
      "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos",
      googleProfileSchema,
    )
  }

  async getCalendarList(token: string) {
    return this.callWithToken(
      token,
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      googleCalendarListSchema,
    )
  }

  async getCalendar(token: string, calendarId: string) {
    console.log({ calendarId })
    return this.callWithToken(
      token,
      `https://www.googleapis.com/calendar/v3/users/me/calendarList/${calendarId}`,
      googleCalendarSchema,
    )
  }

  async createCalendar(token: string, title: string) {
    return await this.callWithToken(
      token,
      "https://www.googleapis.com/calendar/v3/calendars",
      idObjectSchema,
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
      googleCalendarSchema,
      { method: "POST", json: data },
    )
  }

  async getEvents(
    token: string,
    calendarId: string,
    { from, to }: { from?: Dayjs; to?: Dayjs } = {},
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
    return this.callWithToken(token, url, googleEventListSchema)
  }

  async callWithToken<Schema extends z.ZodTypeAny>(
    token: string,
    url: string | URL,
    schema: Schema,
    options?: Omit<GatewayOptions<Schema>, "schema">,
  ) {
    return this.call(url, {
      ...options,
      schema,
      headers: { ...options?.headers, Authorization: `Bearer ${token}` },
    })
  }
}
