import { GoogleGateway } from '@/app/gateways/google'
import { User } from '@/app/models/user'
import { googleEventListTransformer } from '@/app/transformers/google'
import { CalendarEvent } from '@/app/types'
import { Service } from '@/app/utils/service'
import { EventListFetcherErrors } from '.'

export class GoogleEventListFetcher extends Service<
  CalendarEvent[],
  EventListFetcherErrors
> {
  constructor(private gateway: GoogleGateway = new GoogleGateway()) {
    super()
  }

  async call(user: User, calendarId: string) {
    try {
      const res = await this.gateway.events(user, calendarId, this.dateFilters)
      if (!res.success) return this.failure('api_failed')

      const parsed = googleEventListTransformer.safeParse(res.data)
      if (!parsed.success) {
        return this.failure('invalid_response')
      }

      return this.success(parsed.data.items)
    } catch (e) {
      console.error(e)
      return this.failure('server_error')
    }
  }

  private get dateFilters(): { from?: Date; to?: Date } {
    const from = new Date()
    from.setHours(0, 0, 0, 0)

    const to = new Date()
    return { from, to }
  }
}
