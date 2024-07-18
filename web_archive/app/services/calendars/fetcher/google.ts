import { GoogleGateway } from '@/app/gateways/google'
import { User } from '@/app/models/user'
import { googleCalendarTransformer } from '@/app/transformers/google'
import { Calendar } from '@/app/types'
import { Service } from '@/app/utils/service'
import { CalendarFetcherErrors } from '.'

export class GoogleCalendarFetcher extends Service<
  Calendar,
  CalendarFetcherErrors
> {
  constructor(private gateway = new GoogleGateway()) {
    super()
  }

  async call(user: User, calendarId: string) {
    try {
      const res = await this.gateway.getCalendar(user, calendarId)
      if (!res.success) return this.failure('request_failed')
      const parsed = googleCalendarTransformer.safeParse(res.data)

      if (!parsed.success) {
        return this.failure('invalid_response')
      }

      return this.success(parsed.data)
    } catch (e) {
      console.error(e)
      return this.failure('server_error')
    }
  }
}
