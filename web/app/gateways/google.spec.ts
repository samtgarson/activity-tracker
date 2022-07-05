import { userFactory } from '@/test/factories/user'
import { User } from '../models/user'
import { GoogleAccessTokenFetcher } from '../services/auth/providers/google.server'
import { GoogleGateway } from './google'

const fetch = vi.fn()
const token = 'token'
const tokenFetcher = { call: vi.fn(() => token) }
const user = new User(userFactory.build())

describe('Google Gateway', () => {
  let gateway: GoogleGateway

  beforeEach(() => {
    gateway = new GoogleGateway(
      fetch,
      tokenFetcher as unknown as GoogleAccessTokenFetcher
    )
  })

  describe('request', () => {
    const url = 'http://localhost:5000'
    const params = {
      headers: {
        Accept: 'text/plain'
      }
    }

    it('should get a fresh token', async () => {
      await gateway.request(user, url, params)
      expect(tokenFetcher.call).toHaveBeenCalledWith(user)
    })

    it('should call fetch with the correct params', async () => {
      await gateway.request(user, url, params)
      expect(fetch).toHaveBeenCalledWith(url, {
        headers: {
          ...params.headers,
          Authorization: `Bearer ${token}`
        }
      })
    })

    it('should return the response', async () => {
      const response = { ok: true, json: vi.fn(async () => 'response') }
      fetch.mockResolvedValue(response)

      const result = await gateway.request(user, url, params)

      expect(result).toEqual({ success: true, data: 'response' })
    })

    describe('when response is not ok', () => {
      it('should return an error', async () => {
        const response = { ok: false, text: vi.fn(async () => 'response') }
        fetch.mockResolvedValue(response)

        const result = await gateway.request(user, url, params)

        expect(result).toEqual({
          success: false,
          error: `Request to ${url} failed`
        })
      })
    })

    describe('when something goes wrong', () => {
      it('should return an error', async () => {
        fetch.mockRejectedValue(new Error('Something went wrong'))

        const result = await gateway.request(user, url, params)

        expect(result).toEqual({
          success: false,
          error: 'Something unexpected went wrong'
        })
      })
    })
  })

  describe('calendar', () => {
    const calendarId = 'calendarId'
    const url = `https://www.googleapis.com/calendar/v3/users/me/calendarList/${calendarId}`

    it('should call request with the correct params', async () => {
      await gateway.calendar(user, calendarId)
      expect(fetch).toHaveBeenCalledWith(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    })
  })

  describe('calendarList', () => {
    const url = 'https://www.googleapis.com/calendar/v3/users/me/calendarList'

    it('should call request with the correct params', async () => {
      await gateway.calendarList(user)
      expect(fetch).toHaveBeenCalledWith(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    })
  })

  describe('events', () => {
    const calendarId = 'calendarId'
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`
    const params = {
      from: new Date(),
      to: new Date()
    }

    it('should call request with the correct params', async () => {
      await gateway.events(user, calendarId, params)
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(url), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    })

    it('adds the correct query', async () => {
      const expectedUrl = `${url}?maxAttendees=1&orderBy=startTime&singleEvents=true&timeMin=${params.from.toISOString()}&timeMax=${params.to.toISOString()}`
      await gateway.events(user, calendarId, params)

      const [actualUrl] = fetch.mock.calls[0]
      expect(actualUrl).toBeSameUrl(expectedUrl)
    })
  })
})
