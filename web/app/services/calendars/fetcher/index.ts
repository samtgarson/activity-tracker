import { User } from '@/app/models/user'
import { Calendar, Provider } from '@/app/types'
import { ServiceResult } from '@/app/utils/service'
import { GoogleCalendarFetcher } from './google'

export interface ProviderCalendarFetcher {
  call(user: User, calendarId: string): Promise<ServiceResult<Calendar>>
}

export class CalendarFetcher {
  constructor(
    private google: ProviderCalendarFetcher = new GoogleCalendarFetcher()
  ) {}

  async call(
    user: User,
    provider: Provider,
    calendarId: string
  ): Promise<ServiceResult<Calendar>> {
    switch (provider) {
      case 'google':
        return this.google.call(user, calendarId)
    }
  }
}
