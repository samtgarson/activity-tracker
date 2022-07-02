import { Calendar, Provider, ServiceResult, UserWithAccount } from '@/app/types'
import { GoogleCalendarListFetcher } from './google'
import { CalendarFetcher } from './types'

export class CalendarListFetcher {
  constructor(
    private google: CalendarFetcher = new GoogleCalendarListFetcher()
  ) {}

  async call(
    user: UserWithAccount,
    provider: Provider
  ): Promise<ServiceResult<Calendar[]>> {
    const accessToken = this.getAccessToken(user, provider)
    if (!accessToken) return { error: `No access token found for ${provider}` }

    switch (provider) {
      case 'google':
        return this.google.call(accessToken)
      default:
        return { error: `Unknown provider: ${provider}` }
    }
  }

  private getAccessToken(user: UserWithAccount, provider: Provider) {
    return user.account.find((account) => account.provider === provider)
      ?.accessToken
  }
}
