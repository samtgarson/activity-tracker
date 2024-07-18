import { User } from '@/app/models/user'
import { Calendar, Provider } from '@/app/types'
import { Service } from '@/app/utils/service'
import { GoogleCalendarListFetcher } from './google'

export type CalendarListFetcherErrors = {
  server_error: undefined
  request_failed: undefined
  invalid_response: undefined
}

export class CalendarListFetcher extends Service<
  Calendar[],
  CalendarListFetcherErrors
> {
  constructor(private google = new GoogleCalendarListFetcher()) {
    super()
  }

  async call(user: User, provider: Provider) {
    switch (provider) {
      case 'google':
        return this.google.call(user)
    }
  }
}
