import { User } from '@/app/models/user'
import { Provider } from '@/app/types'
import { GoogleCalendarCreator } from './google'

export type CalendarCreatorErrors = {
  server_error: undefined
  request_failed: undefined
  invalid_response: undefined
}

export class CalendarCreator {
  constructor(private google = new GoogleCalendarCreator()) {}

  async call(user: User, provider: Provider, title: string) {
    switch (provider) {
      case 'google':
        return this.google.call(user, title)
    }
  }
}
