import { User } from '@/app/models/user'
import { CalendarEvent, Provider } from '@/app/types'
import { ServiceResult } from '@/app/utils/service'
import { GoogleEventListFetcher } from './google'

export interface ProviderEventListFetcher {
  call(user: User, calendarId: string): Promise<ServiceResult<CalendarEvent[]>>
}

export class EventListFetcher {
  constructor(
    private google: ProviderEventListFetcher = new GoogleEventListFetcher()
  ) {}

  async call(
    user: User,
    provider: Provider,
    calendarId: string
  ): Promise<ServiceResult<CalendarEvent[]>> {
    switch (provider) {
      case 'google':
        return this.google.call(user, calendarId)
    }
  }
}
