import { GoogleGateway } from '@/app/gateways/google'
import { User } from '@/app/models/user'
import { googleCalendarFactory } from '@/test/factories/google'
import { userFactory } from '@/test/factories/user'
import { GoogleCalendarCreator } from './google'

const user = new User(userFactory.build())
const calendarId = 'calendarId'
const gateway = {
  createCalendar: vi.fn(),
  addCalendarToList: vi.fn()
}

const calendar = googleCalendarFactory.build()

describe('GoogleCalendarFetcher', () => {
  let fetcher: GoogleCalendarCreator

  beforeEach(() => {
    fetcher = new GoogleCalendarCreator(gateway as unknown as GoogleGateway)
    gateway.createCalendar.mockResolvedValue({ success: true, data: calendar })
    gateway.addCalendarToList.mockResolvedValue({
      success: true,
      data: calendar
    })
  })

  it('should call the gateway correctly', async () => {
    await fetcher.call(user, calendarId)
    expect(gateway.createCalendar).toHaveBeenCalledWith(user, calendarId)
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
      gateway.createCalendar.mockResolvedValue({
        success: true,
        data: { foo: 1 }
      })
    })

    it('should return error', async () => {
      const res = await fetcher.call(user, calendarId)
      expect(!res.success && res.code).toEqual('invalid_response')
    })
  })

  describe('when something unexpected goes wrong', () => {
    beforeEach(() => {
      gateway.createCalendar.mockRejectedValue('error')
    })

    it('should return error', async () => {
      const res = await fetcher.call(user, calendarId)
      expect(!res.success && res.code).toEqual('server_error')
    })
  })
})
