import { Calendar, Provider, ServiceResult, UserWithAccount } from '@/app/types'
import { GoogleCalendarListFetcher } from './google'

export interface CalendarFetcher {
  call(user: UserWithAccount): Promise<ServiceResult<Calendar[]>>
}

export class CalendarListFetcher {
  constructor(
    private google: CalendarFetcher = new GoogleCalendarListFetcher()
  ) {}

  async call(
    user: UserWithAccount,
    provider: Provider
  ): Promise<ServiceResult<Calendar[]>> {
    switch (provider) {
      case 'google':
        return this.google.call(user)
    }
  }
}
