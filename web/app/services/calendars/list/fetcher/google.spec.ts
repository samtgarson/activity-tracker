import { googleCalendarFactory } from '@/test/factories/google'
import { GoogleCalendarListFetcher } from './google'

const accessToken = 'accessToken'
const fetch = vi.fn()

const calendar1 = googleCalendarFactory.build()
const calendar2 = googleCalendarFactory.build({
  summaryOverride: 'My Calendar 2',
  accessRole: 'reader'
})

describe('GoogleCalendarListFetcher', () => {
  let fetcher: GoogleCalendarListFetcher

  beforeEach(() => {
    fetcher = new GoogleCalendarListFetcher(fetch)
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [calendar1, calendar2] })
    })
  })

  it('should call fetch with the correct url', async () => {
    await fetcher.call(accessToken)
    expect(fetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
  })

  it('should return the correct data', async () => {
    const result = await fetcher.call(accessToken)
    expect(result).toEqual({
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
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [{ id: 'id' }] })
      })
    })

    it('should return error', async () => {
      const res = await fetcher.call(accessToken)
      expect(res.error).toEqual('Could not parse response from Google')
    })
  })

  describe('when the response is not ok', () => {
    beforeEach(() => {
      fetch.mockResolvedValue({
        ok: false,
        json: async () => null,
        text: async () => 'error'
      })
    })

    it('should return error', async () => {
      const res = await fetcher.call(accessToken)
      expect(res.error).toEqual('Could not fetch calendars from Google')
    })
  })

  describe('when something unexpected goes wrong', () => {
    beforeEach(() => {
      fetch.mockRejectedValue('error')
    })

    it('should return error', async () => {
      const res = await fetcher.call(accessToken)
      expect(res.error).toEqual('Something unexpected went wrong')
    })
  })
})
