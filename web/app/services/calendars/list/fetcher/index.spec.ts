import { Account, Provider, UserWithAccount } from '@/app/types'
import { accountFactory, userFactory } from '@/test/factories/user'
import { CalendarListFetcher } from '.'

describe('CalendarListFetcher', () => {
  const googleFetcher = { call: vi.fn() }
  let user: UserWithAccount
  let fetcher: CalendarListFetcher

  beforeEach(() => {
    user = userFactory.build()

    fetcher = new CalendarListFetcher(googleFetcher)
  })

  describe('when the user has no account for the provider', () => {
    it('should return an error', async () => {
      const result = await fetcher.call(user, 'office' as Provider)
      expect(result).toEqual({
        error: `No access token found for office`
      })
    })
  })

  describe('google', () => {
    it('should call google fetcher', async () => {
      await fetcher.call(user, 'google')
      expect(googleFetcher.call).toHaveBeenCalledWith(
        user.account[0].accessToken
      )
    })

    it('should return the correct data', async () => {
      const data = [{ id: 1 }]
      googleFetcher.call.mockResolvedValue({ data })
      const result = await fetcher.call(user, 'google')
      expect(result).toEqual({ data })
    })
  })

  describe('for an unrecognized provider', () => {
    it('should return an error', async () => {
      user.account.push(
        accountFactory.build({ provider: 'office' as Provider })
      )
      const result = await fetcher.call(user, 'office' as Provider)
      expect(result).toEqual({
        error: `Unknown provider: office`
      })
    })
  })
})
