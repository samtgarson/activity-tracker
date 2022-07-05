import { GoogleGateway } from '@/app/gateways/google'
import { User } from '@/app/models/user'
import { Svc } from '@/app/utils/service'
import { googleCalendarFactory } from '@/test/factories/google'
import { userFactory } from '@/test/factories/user'
import { GoogleCalendarFetcher } from './google'

const user = new User(userFactory.build())
const calendarId = 'calendarId'
const gateway = {
  calendar: vi.fn()
}

const calendar = googleCalendarFactory.build()

describe('GoogleCalendarFetcher', () => {
  let fetcher: GoogleCalendarFetcher

  beforeEach(() => {
    fetcher = new GoogleCalendarFetcher(gateway as unknown as GoogleGateway)
    gateway.calendar.mockResolvedValue(Svc.success(calendar))
  })

  it('should call the gateway correctly', async () => {
    await fetcher.call(user, calendarId)
    expect(gateway.calendar).toHaveBeenCalledWith(user, calendarId)
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
      gateway.calendar.mockResolvedValue(Svc.success({ foo: 1 }))
    })

    it('should return error', async () => {
      const res = await fetcher.call(user, calendarId)
      expect(!res.success && res.error).toEqual(
        'Could not parse response from Google'
      )
    })
  })

  describe('when something unexpected goes wrong', () => {
    beforeEach(() => {
      gateway.calendar.mockRejectedValue('error')
    })

    it('should return error', async () => {
      const res = await fetcher.call(user, calendarId)
      expect(!res.success && res.error).toEqual(
        'Something unexpected went wrong'
      )
    })
  })
})
