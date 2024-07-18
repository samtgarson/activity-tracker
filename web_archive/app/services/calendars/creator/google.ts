import { idObjectSchema } from '@/app/contracts'
import { GoogleGateway } from '@/app/gateways/google'
import { User } from '@/app/models/user'
import { googleCalendarTransformer } from '@/app/transformers/google'
import { Calendar } from '@/app/types'
import { Service } from '@/app/utils/service'
import type { CalendarCreatorErrors } from '.'

export class GoogleCalendarCreator extends Service<
  Calendar,
  CalendarCreatorErrors
> {
  constructor(private gateway = new GoogleGateway()) {
    super()
  }

  async call(user: User, title: string) {
    try {
      const created = await this.createCalendar(user, title)
      if (!created.success) return created

      return this.insertCalendar(user, created.data)
    } catch (e) {
      console.error(e)
      return this.failure('server_error')
    }
  }

  private async insertCalendar(user: User, calendarId: string) {
    const res = await this.gateway.addCalendarToList(
      user,
      calendarId,
      '#000000',
      '#FFB5B4'
    )
    if (!res.success) return this.failure('request_failed')

    const parsed = googleCalendarTransformer.safeParse(res.data)

    if (!parsed.success) {
      return this.failure('request_failed')
    }

    return this.success(parsed.data)
  }

  private async createCalendar(user: User, title: string) {
    const res = await this.gateway.createCalendar(user, title)
    if (!res.success) return this.failure('request_failed')

    const parsed = idObjectSchema.safeParse(res.data)

    if (!parsed.success) {
      return this.failure('invalid_response')
    }

    return this.success(parsed.data.id)
  }
}
