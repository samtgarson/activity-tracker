import { UserWithAccount } from '@/app/types'
import { getEnv } from '@/app/utils/env'
import { prismaClient } from '@/app/utils/prisma'
import { findAccount } from '@/app/utils/user'
import { OAuth2Client } from 'google-auth-library'

export const googleClientId = getEnv('GOOGLE_CLIENT_ID')
export const googleClientSecret = getEnv('GOOGLE_CLIENT_SECRET')
export const googleRedirectUrl = getEnv('BASE_URL') + '/auth/google/callback'

export interface AccessTokenFetcher {
  call(user: UserWithAccount): Promise<string | null>
}

export class GoogleAccessTokenFetcher implements AccessTokenFetcher {
  private client = new OAuth2Client(
    googleClientId,
    googleClientSecret,
    googleRedirectUrl
  )

  async call(user: UserWithAccount) {
    const account = findAccount(user, 'google')
    if (!account) throw new Error('User has no Google account')

    this.client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken
    })

    this.client.on('tokens', ({ access_token: accessToken }) => {
      if (!accessToken) return
      console.log('Received new access token')
      prismaClient.account.update({
        where: { id: account.id },
        data: { accessToken }
      })
    })

    const { token } = await this.client.getAccessToken()
    return token ?? null
  }
}
