import { User } from '@/app/models/user'
import { Calendar, CalendarEvent } from '@/app/types'
import { userFactory } from '@/test/factories/user'
import { CalendarFetcher } from '../calendars/fetcher'
import { EventListFetcher } from '../events/list-fetcher'
import { DashboardFetcher } from './dashboard-fetcher'

const calendar = { title: 'Calendar' } as Calendar
const events = [{ title: 'Event' }] as CalendarEvent[]
const calendarFetcher = { call: vi.fn() }
const eventListFetcher = { call: vi.fn() }
const user = new User(userFactory.active().build())

describe('DashboardFetcher', () => {
  let fetcher: DashboardFetcher

  beforeEach(() => {
    fetcher = new DashboardFetcher(
      calendarFetcher as unknown as CalendarFetcher,
      eventListFetcher as unknown as EventListFetcher
    )
  })

  describe('when the fetches succeed', () => {
    beforeEach(() => {
      calendarFetcher.call.mockResolvedValueOnce({
        success: true,
        data: calendar
      })
      eventListFetcher.call.mockResolvedValueOnce({
        success: true,
        data: events
      })
    })

    it('should call calendar fetcher', async () => {
      await fetcher.call(user)
      expect(calendarFetcher.call).toHaveBeenCalledWith(
        user,
        user.activeAccount?.provider,
        user.activeAccount?.calendarId
      )
    })

    it('should call event list fetcher', async () => {
      await fetcher.call(user)
      expect(eventListFetcher.call).toHaveBeenCalledWith(
        user,
        user.activeAccount?.provider,
        user.activeAccount?.calendarId
      )
    })

    it('should return the data', async () => {
      const result = await fetcher.call(user)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ calendar, events })
    })
  })

  describe('when calendar fetcher fails', () => {
    beforeEach(() => {
      calendarFetcher.call.mockResolvedValueOnce({
        success: false,
        code: 'no_calendar'
      })
    })

    it('should return the error', async () => {
      const result = await fetcher.call(user)

      expect(result.success).toBe(false)
      expect(!result.success && result.code).toBe('no_calendar')
    })
  })

  describe('when event list fetcher fails', () => {
    beforeEach(() => {
      calendarFetcher.call.mockResolvedValueOnce({
        success: true,
        data: calendar
      })
      eventListFetcher.call.mockResolvedValueOnce({
        success: false,
        code: 'server_error'
      })
    })

    it('should return the error', async () => {
      const result = await fetcher.call(user)

      expect(result.success).toBe(false)
      expect(!result.success && result.code).toBe('server_error')
    })
  })
})
