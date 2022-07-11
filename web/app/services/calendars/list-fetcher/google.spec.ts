import { GoogleGateway } from '@/app/gateways/google'
import { User } from '@/app/models/user'
import { googleCalendarFactory } from '@/test/factories/google'
import { userFactory } from '@/test/factories/user'
import { GoogleCalendarListFetcher } from './google'

const user = new User(userFactory.build())
const gateway = {
  getCalendarList: vi.fn()
}

const calendar1 = googleCalendarFactory.build()
const calendar2 = googleCalendarFactory.build({
  summaryOverride: 'My Calendar 2',
  accessRole: 'reader'
})

describe('GoogleCalendarListFetcher', () => {
  let fetcher: GoogleCalendarListFetcher

  beforeEach(() => {
    fetcher = new GoogleCalendarListFetcher(gateway as unknown as GoogleGateway)
    gateway.getCalendarList.mockResolvedValue({
      success: true,
      data: { items: [calendar1, calendar2] }
    })
  })

  it('should call the gateway correctly', async () => {
    await fetcher.call(user)
    expect(gateway.getCalendarList).toHaveBeenCalledWith(user)
  })

  it('should return the correct data', async () => {
    const result = await fetcher.call(user)
    expect(result).toEqual({
      success: true,
      data: [
        {
          color: calendar1.backgroundColor,
          id: calendar1.id,
          description: calendar1.description,
          writeAccess: true,
          title: calendar1.summary
        },
        {
          color: calendar2.backgroundColor,
          id: calendar2.id,
          description: calendar2.description,
          writeAccess: false,
          title: calendar2.summaryOverride
        }
      ]
    })
  })

  describe('when response cannot be parsed', () => {
    beforeEach(() => {
      gateway.getCalendarList.mockResolvedValue({
        success: true,
        data: { item: [] }
      })
    })

    it('should return error', async () => {
      const res = await fetcher.call(user)
      expect(!res.success && res.code).toEqual('invalid_response')
    })
  })

  describe('when something unexpected goes wrong', () => {
    beforeEach(() => {
      gateway.getCalendarList.mockRejectedValue('error')
    })

    it('should return error', async () => {
      const res = await fetcher.call(user)
      expect(!res.success && res.code).toEqual('server_error')
    })
  })
})
