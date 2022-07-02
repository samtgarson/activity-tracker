import {
  GoogleCalendarList,
  googleCalendarListSchema
} from '@/app/contracts/google'
import {
  AccessTokenFetcher,
  GoogleAccessTokenFetcher
} from '@/app/services/auth/providers/google.server'
import { Calendar, UserWithAccount } from '@/app/types'
import { CalendarFetcher } from './types'

export class GoogleCalendarListFetcher implements CalendarFetcher {
  constructor(
    private fetch = global.fetch,
    private authClient: AccessTokenFetcher = new GoogleAccessTokenFetcher()
  ) {}

  async call(user: UserWithAccount) {
    try {
      const json = await this.makeRequest(user)
      if (!json) return { error: 'Could not fetch calendars from Google' }
      const parsed = googleCalendarListSchema.safeParse(json)

      if (!parsed.success) {
        return { error: 'Could not parse response from Google' }
      }

      return { data: this.normalize(parsed.data) }
    } catch (e) {
      console.error(e)
      return { error: 'Something unexpected went wrong' }
    }
  }

  private async makeRequest(user: UserWithAccount) {
    const token = await this.authClient.call(user)
    const res = await this.fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const json = await res.json()
    if (!res.ok) {
      console.error(json)
      return null
    }
    return json
  }

  private normalize(calendar: GoogleCalendarList): Calendar[] {
    return calendar.items.map((item) => ({
      color: item.backgroundColor,
      id: item.id,
      description: item.description,
      writeAccess: ['writer', 'owner'].includes(item.accessRole),
      title: item.summaryOverride || item.summary
    }))
  }
}
