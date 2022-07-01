import { CalendarList, calendarListSchema } from '@/app/contracts/google'
import { Calendar } from '@/app/types'
import { errorMessage } from '@/app/utils/errors'
import { CalendarFetcher } from './types'

export class GoogleCalendarsListFetcher implements CalendarFetcher {
  async call(accessToken: string) {
    try {
      const json = await this.makeRequest(accessToken)

      const parsed = calendarListSchema.safeParse(json)

      if (!parsed.success) return { error: parsed.error.toString() }

      return { data: this.normalize(parsed.data) }
    } catch (e) {
      return { error: errorMessage(e) }
    }
  }

  private async makeRequest(accessToken: string) {
    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    )

    if (!res.ok) throw await res.text()
    return res.json()
  }

  private normalize(calendar: CalendarList): Calendar[] {
    return calendar.items.map((item) => ({
      color: item.backgroundColor,
      id: item.id,
      description: item.description,
      writeAccess: ['writer', 'owner'].includes(item.accessRole)
    }))
  }
}
