import { User } from '@/app/models/user'
import { Calendar } from '@/app/types'
import { userFactory } from '@/test/factories/user'
import { CalendarFetcher } from '.'
import { GoogleCalendarFetcher } from './google'

describe('CalendarFetcher', () => {
  const googleFetcher = { call: vi.fn() } as unknown as GoogleCalendarFetcher
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
      const data = { id: 1 } as unknown as Calendar
      vi.mocked(googleFetcher.call).mockResolvedValue({ success: true, data })
      const result = await fetcher.call(user, 'google', calendarId)
      expect(result).toEqual({ success: true, data })
    })
  })
})
