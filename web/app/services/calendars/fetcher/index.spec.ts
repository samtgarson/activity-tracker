import { User } from '@/app/models/user'
import { userFactory } from '@/test/factories/user'
import { CalendarFetcher } from '.'

describe('CalendarFetcher', () => {
  const googleFetcher = { call: vi.fn() }
  const calendarId = 'calendarId'
  let user: User
  let fetcher: CalendarFetcher

  beforeEach(() => {
    user = new User(userFactory.build())

    fetcher = new CalendarFetcher(googleFetcher)
  })

  describe('google', () => {
    it('should call google fetcher', async () => {
      await fetcher.call(user, 'google', calendarId)
      expect(googleFetcher.call).toHaveBeenCalledWith(user, calendarId)
    })

    it('should return the correct data', async () => {
      const data = { id: 1 }
      googleFetcher.call.mockResolvedValue({ data })
      const result = await fetcher.call(user, 'google', calendarId)
      expect(result).toEqual({ data })
    })
  })
})
