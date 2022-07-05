import { googleCalendarSchema } from '@/app/contracts/google'
import { GoogleGateway } from '@/app/gateways/google'
import { User } from '@/app/models/user'
import { Calendar } from '@/app/types'
import { ServiceResult, Svc } from '@/app/utils/service'
import { ProviderCalendarFetcher } from '.'

export class GoogleCalendarFetcher implements ProviderCalendarFetcher {
  constructor(private gateway = new GoogleGateway()) {}

  async call(user: User, calendarId: string): Promise<ServiceResult<Calendar>> {
    try {
      const res = await this.gateway.calendar(user, calendarId)
      if (!res.success)
        return Svc.error('Could not fetch calendars from Google')
      const parsed = googleCalendarSchema.safeParse(res.data)

      if (!parsed.success) {
        return Svc.error('Could not parse response from Google')
      }

      return Svc.success(parsed.data)
    } catch (e) {
      console.error(e)
      return Svc.error('Something unexpected went wrong')
    }
  }
}
