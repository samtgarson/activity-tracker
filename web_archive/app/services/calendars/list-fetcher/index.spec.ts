import { User } from '@/app/models/user'
import { Calendar } from '@/app/types'
import { userFactory } from '@/test/factories/user'
import { CalendarListFetcher } from '.'
import { GoogleCalendarListFetcher } from './google'

describe('CalendarListFetcher', () => {
  const googleFetcher = {
    call: vi.fn()
  } as unknown as GoogleCalendarListFetcher
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
      const data = [{ id: 1 }] as unknown as Calendar[]
      vi.mocked(googleFetcher.call).mockResolvedValue({ success: true, data })
      const result = await fetcher.call(user, 'google')
      expect(result).toEqual({ success: true, data })
    })
  })
})
