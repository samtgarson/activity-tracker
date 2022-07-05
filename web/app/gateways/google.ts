import { User } from '@/app/models/user'
import {
  AccessTokenFetcher,
  GoogleAccessTokenFetcher
} from '@/app/services/auth/providers/google.server'
import { Svc } from '@/app/utils/service'

export class GoogleGateway {
  constructor(
    private fetch = global.fetch,
    private authClient: AccessTokenFetcher = new GoogleAccessTokenFetcher()
  ) {}

  async calendarList(user: User) {
    return this.request(
      user,
      'https://www.googleapis.com/calendar/v3/users/me/calendarList'
    )
  }

  async calendar(user: User, calendarId: string) {
    return this.request(
      user,
      `https://www.googleapis.com/calendar/v3/users/me/calendarList/${calendarId}`
    )
  }

  async request(user: User, url: string, options?: RequestInit) {
    try {
      const token = await this.authClient.call(user)
      const res = await this.fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        console.error(await res.text())
        return Svc.error(`Request to ${url} failed`)
      }

      const json = await res.json()
      return Svc.success(json)
    } catch (e) {
      console.error(e)
      return Svc.error('Something unexpected went wrong')
    }
  }
}
