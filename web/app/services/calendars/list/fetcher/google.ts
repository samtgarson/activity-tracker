import {
  GoogleCalendarList,
  googleCalendarListSchema
} from '@/app/contracts/google'
import { User } from '@/app/models/user'
import {
  AccessTokenFetcher,
  GoogleAccessTokenFetcher
} from '@/app/services/auth/providers/google.server'
import { Calendar } from '@/app/types'
import { ServiceResult, Svc } from '@/app/utils/service'
import { CalendarFetcher } from '.'

export class GoogleCalendarListFetcher implements CalendarFetcher {
  constructor(
    private fetch = global.fetch,
    private authClient: AccessTokenFetcher = new GoogleAccessTokenFetcher()
  ) {}

  async call(user: User): Promise<ServiceResult<Calendar[]>> {
    try {
      const json = await this.makeRequest(user)
      if (!json) return Svc.error('Could not fetch calendars from Google')
      const parsed = googleCalendarListSchema.safeParse(json)

      if (!parsed.success) {
        return Svc.error('Could not parse response from Google')
      }

      return Svc.success(this.normalize(parsed.data))
    } catch (e) {
      console.error(e)
      return Svc.error('Something unexpected went wrong')
    }
  }

  private async makeRequest(user: User) {
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
