import { googleEventListSchema } from '@/app/contracts/google'
import { GoogleGateway } from '@/app/gateways/google'
import { User } from '@/app/models/user'
import { CalendarEvent } from '@/app/types'
import { ServiceResult, Svc } from '@/app/utils/service'
import { ProviderEventListFetcher } from '.'

export class GoogleEventListFetcher implements ProviderEventListFetcher {
  constructor(private gateway: GoogleGateway = new GoogleGateway()) {}

  async call(
    user: User,
    calendarId: string
  ): Promise<ServiceResult<CalendarEvent[]>> {
    try {
      const res = await this.gateway.events(user, calendarId, this.dateFilters)
      if (!res.success) return Svc.error('Could not fetch events from Google')

      const parsed = googleEventListSchema.safeParse(res.data)
      if (!parsed.success) {
        return Svc.error('Could not parse response from Google')
      }

      return Svc.success(parsed.data.items)
    } catch (e) {
      console.error(e)
      return Svc.error('Something unexpected went wrong')
    }
  }

  private get dateFilters(): { from?: Date; to?: Date } {
    const from = new Date()
    from.setHours(0, 0, 0, 0)

    const to = new Date()
    return { from, to }
  }
}
