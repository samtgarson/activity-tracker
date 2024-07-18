import { GoogleGateway } from '@/app/gateways/google'
import { User } from '@/app/models/user'
import { googleCalendarFactory } from '@/test/factories/google'
import { userFactory } from '@/test/factories/user'
import { GoogleCalendarFetcher } from './google'

const user = new User(userFactory.build())
const calendarId = 'calendarId'
const gateway = {
  getCalendar: vi.fn()
}

const calendar = googleCalendarFactory.build()

describe('GoogleCalendarFetcher', () => {
  let fetcher: GoogleCalendarFetcher

  beforeEach(() => {
    fetcher = new GoogleCalendarFetcher(gateway as unknown as GoogleGateway)
    gateway.getCalendar.mockResolvedValue({ success: true, data: calendar })
  })

  it('should call the gateway correctly', async () => {
    await fetcher.call(user, calendarId)
    expect(gateway.getCalendar).toHaveBeenCalledWith(user, calendarId)
  })

  it('should return the correct data', async () => {
    const result = await fetcher.call(user, calendarId)
    expect(result).toEqual({
      success: true,
      data: {
        color: calendar.backgroundColor,
        id: calendar.id,
        description: calendar.description,
        writeAccess: true,
        title: calendar.summary
      }
    })
  })

  describe('when response cannot be parsed', () => {
    beforeEach(() => {
      gateway.getCalendar.mockResolvedValue({ success: true, data: { foo: 1 } })
    })

    it('should return error', async () => {
      const res = await fetcher.call(user, calendarId)
      expect(!res.success && res.code).toEqual('invalid_response')
    })
  })

  describe('when something unexpected goes wrong', () => {
    beforeEach(() => {
      gateway.getCalendar.mockRejectedValue('error')
    })

    it('should return error', async () => {
      const res = await fetcher.call(user, calendarId)
      expect(!res.success && res.code).toEqual('server_error')
    })
  })
})
