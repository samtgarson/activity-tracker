import { Calendar, Provider, ServiceResult, UserWithAccount } from '@/app/types'
import { GoogleCalendarsListFetcher } from './google'
import { CalendarFetcher } from './types'

export class CalendarsListFetcher {
  constructor(
    private google: CalendarFetcher = new GoogleCalendarsListFetcher()
  ) {}

  async call(
    user: UserWithAccount,
    provider: Provider
  ): Promise<ServiceResult<Calendar[]>> {
    const accessToken = this.getAccessToken(user, provider)

    switch (provider) {
      case 'google':
        return this.google.call(accessToken)
      default:
        return { error: `Unknown provider: ${provider}` }
    }
  }

  private getAccessToken(user: UserWithAccount, provider: Provider) {
    const token = user.account.find(
      (account) => account.provider === provider
    )?.accessToken
    if (!token) throw new Error(`No access token for ${provider}`)
    return token
  }
}
