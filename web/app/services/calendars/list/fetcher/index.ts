import { User } from '@/app/models/user'
import { Calendar, Provider } from '@/app/types'
import { ServiceResult } from '@/app/utils/service'
import { GoogleCalendarListFetcher } from './google'

export interface CalendarFetcher {
  call(user: User): Promise<ServiceResult<Calendar[]>>
}

export class CalendarListFetcher {
  constructor(
    private google: CalendarFetcher = new GoogleCalendarListFetcher()
  ) {}

  async call(
    user: User,
    provider: Provider
  ): Promise<ServiceResult<Calendar[]>> {
    switch (provider) {
      case 'google':
        return this.google.call(user)
    }
  }
}
