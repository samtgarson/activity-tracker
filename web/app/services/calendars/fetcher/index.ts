import { User } from '@/app/models/user'
import { Provider } from '@/app/types'
import { GoogleCalendarFetcher } from './google'

export type CalendarFetcherErrors = {
  server_error: undefined
  request_failed: undefined
  invalid_response: undefined
}

export class CalendarFetcher {
  constructor(private google = new GoogleCalendarFetcher()) {}

  async call(user: User, provider: Provider, calendarId: string) {
    switch (provider) {
      case 'google':
        return this.google.call(user, calendarId)
    }
  }
}
