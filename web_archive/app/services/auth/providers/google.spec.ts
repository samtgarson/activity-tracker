import { User } from '@/app/models/user'
import { userFactory } from '@/test/factories/user'
import { GoogleAccessTokenFetcher, GoogleOAuth2Client } from './google.server'

let user: User
const token = 'access-token'
const client: GoogleOAuth2Client = {
  getAccessToken: vi.fn(async () => ({ token })),
  setCredentials: vi.fn()
}

describe('GoogleAccessTokenFetcher', () => {
  let fetcher: GoogleAccessTokenFetcher

  beforeEach(() => {
    fetcher = new GoogleAccessTokenFetcher(client)
    user = new User(userFactory.build())
  })

  describe('when the account exists', () => {
    it('should set the refresh token', async () => {
      fetcher.call(user)

      expect(client.setCredentials).toHaveBeenCalledWith({
        refresh_token: user.accountFor('google')?.refreshToken
      })
    })

    it('should return the access token', async () => {
      const token = await fetcher.call(user)

      expect(token).toBe(token)
    })
  })

  describe('when the account does not exist', () => {
    beforeEach(() => {
      user.account = []
    })

    it('should create the account', async () => {
      expect(() => fetcher.call(user)).rejects.toHaveProperty(
        'message',
        'User has no Google account'
      )
    })
  })
})
