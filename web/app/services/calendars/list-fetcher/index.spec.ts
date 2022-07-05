import { User } from '@/app/models/user'
import { userFactory } from '@/test/factories/user'
import { CalendarListFetcher } from '.'

describe('CalendarListFetcher', () => {
  const googleFetcher = { call: vi.fn() }
  let user: User
  let fetcher: CalendarListFetcher

  beforeEach(() => {
    user = new User(userFactory.build())

    fetcher = new CalendarListFetcher(googleFetcher)
  })

  describe('google', () => {
    it('should call google fetcher', async () => {
      await fetcher.call(user, 'google')
      expect(googleFetcher.call).toHaveBeenCalledWith(user)
    })

    it('should return the correct data', async () => {
      const data = [{ id: 1 }]
      googleFetcher.call.mockResolvedValue({ data })
      const result = await fetcher.call(user, 'google')
      expect(result).toEqual({ data })
    })
  })
})
