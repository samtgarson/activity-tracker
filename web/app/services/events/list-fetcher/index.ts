import { User } from '@/app/models/user'
import { Provider } from '@/app/types'
import { GoogleEventListFetcher } from './google'

export type EventListFetcherErrors = {
  server_error: undefined
  api_failed: undefined
  invalid_response: undefined
}

export class EventListFetcher {
  constructor(private google = new GoogleEventListFetcher()) {}

  async call(user: User, provider: Provider, calendarId: string) {
    switch (provider) {
      case 'google':
        return this.google.call(user, calendarId)
    }
  }
}
