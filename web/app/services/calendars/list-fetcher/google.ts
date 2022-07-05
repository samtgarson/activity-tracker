import { googleCalendarListSchema } from '@/app/contracts/google'
import { GoogleGateway } from '@/app/gateways/google'
import { User } from '@/app/models/user'
import { Calendar } from '@/app/types'
import { ServiceResult, Svc } from '@/app/utils/service'
import { ProviderCalendarListFetcher } from '.'

export class GoogleCalendarListFetcher implements ProviderCalendarListFetcher {
  constructor(private gateway = new GoogleGateway()) {}

  async call(user: User): Promise<ServiceResult<Calendar[]>> {
    try {
      const res = await this.gateway.calendarList(user)
      if (!res.success)
        return Svc.error('Could not fetch calendars from Google')
      const parsed = googleCalendarListSchema.safeParse(res.data)

      if (!parsed.success) {
        return Svc.error('Could not parse response from Google')
      }

      return Svc.success(parsed.data.items)
    } catch (e) {
      console.error(e)
      return Svc.error('Something unexpected went wrong')
    }
  }
}
