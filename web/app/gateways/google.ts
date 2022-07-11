import { User } from '@/app/models/user'
import {
  AccessTokenFetcher,
  GoogleAccessTokenFetcher
} from '@/app/services/auth/providers/google.server'
import { Service } from '../utils/service'
import { GatewayErrors } from './types'

export class GoogleGateway extends Service<unknown, GatewayErrors> {
  constructor(
    private fetch = global.fetch,
    private authClient: AccessTokenFetcher = new GoogleAccessTokenFetcher()
  ) {
    super()
  }

  async getCalendarList(user: User) {
    return this.call(
      user,
      'https://www.googleapis.com/calendar/v3/users/me/calendarList'
    )
  }

  async getCalendar(user: User, calendarId: string) {
    return this.call(
      user,
      `https://www.googleapis.com/calendar/v3/users/me/calendarList/${calendarId}`
    )
  }

  async createCalendar(user: User, title: string) {
    return await this.call(
      user,
      'https://www.googleapis.com/calendar/v3/calendars',
      { method: 'POST', body: JSON.stringify({ summary: title }) }
    )
  }

  async addCalendarToList(
    user: User,
    calendarId: string,
    foregroundColor: string,
    backgroundColor: string
  ) {
    const data = {
      id: calendarId,
      selected: true,
      backgroundColor,
      foregroundColor
    }

    return await this.call(
      user,
      'https://www.googleapis.com/calendar/v3/users/me/calendarList?colorRgbFormat=true',
      { method: 'POST', body: JSON.stringify(data) }
    )
  }

  async events(
    user: User,
    calendarId: string,
    { from, to }: { from?: Date; to?: Date } = {}
  ) {
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`
    )
    url.searchParams.set('maxAttendees', '1')
    url.searchParams.set('orderBy', 'startTime')
    url.searchParams.set('singleEvents', 'true')
    if (from) url.searchParams.set('timeMin', from.toISOString())
    if (to) url.searchParams.set('timeMax', to.toISOString())
    return this.call(user, url.toString())
  }

  async call(user: User, url: string, options?: RequestInit) {
    try {
      const token = await this.authClient.call(user)
      const res = await this.fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        return this.failure('request_failed', res)
      }

      const json = await res.json()
      return this.success(json)
    } catch (e) {
      console.error(e)
      return this.failure('server_error', e)
    }
  }
}
