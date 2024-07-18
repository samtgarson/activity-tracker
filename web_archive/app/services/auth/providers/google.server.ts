import { User } from '@/app/models/user'
import { getEnv } from '@/app/utils/env'
import { OAuth2Client } from 'google-auth-library'
import { GetAccessTokenResponse } from 'google-auth-library/build/src/auth/oauth2client'

export const googleClientId = getEnv('GOOGLE_CLIENT_ID')
export const googleClientSecret = getEnv('GOOGLE_CLIENT_SECRET')
export const googleRedirectUrl = getEnv('BASE_URL') + '/auth/google/callback'

export interface AccessTokenFetcher {
  call(user: User): Promise<string | null>
}

export interface GoogleOAuth2Client {
  getAccessToken(): Promise<GetAccessTokenResponse>
  setCredentials(credentials: { refresh_token: string }): void
}

export class GoogleAccessTokenFetcher implements AccessTokenFetcher {
  constructor(
    private client: GoogleOAuth2Client = new OAuth2Client(
      googleClientId,
      googleClientSecret,
      googleRedirectUrl
    )
  ) {}

  async call(user: User) {
    const account = user.accountFor('google')
    if (!account) throw new Error('User has no Google account')

    this.client.setCredentials({
      refresh_token: account.refreshToken
    })

    const { token } = await this.client.getAccessToken()
    return token ?? null
  }
}
