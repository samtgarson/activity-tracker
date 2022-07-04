import { userFactory } from '@/test/factories/user'
import { Authenticator } from 'remix-auth'
import { User } from '../models/user'
import { AuthenticatorResult } from '../services/auth/auth.server'
import { UserFinder } from '../services/users/finder'
import { getUser } from './auth.server'

describe('getUser', () => {
  const userId = 'userId'
  const isAuthenticated = vi.fn(() => ({ userId }))
  const authenticator = {
    isAuthenticated
  } as unknown as Authenticator<AuthenticatorResult>
  const userFinderCall = vi.fn()
  const userFinder = { call: userFinderCall } as unknown as UserFinder
  const request = new Request('http://localhost:5000/')
  const redirect = vi.fn()

  describe('when the user exists', () => {
    const user = new User(userFactory.build())

    beforeEach(() => {
      userFinderCall.mockResolvedValue({ data: user, error: undefined })
    })

    it('authenticates the request', async () => {
      await getUser(request, { authenticator, userFinder, redirect })
      expect(isAuthenticated).toHaveBeenCalledWith(request, {
        failureRedirect: '/'
      })
    })

    it('should return the user', async () => {
      const res = await getUser(request, {
        authenticator,
        userFinder,
        redirect
      })

      expect(userFinderCall).toHaveBeenCalledWith(userId)
      expect(res).toEqual(user)
    })
  })

  describe('when the user does not exist', () => {
    beforeEach(() => {
      userFinderCall.mockResolvedValue({ data: undefined, error: 'error' })
      redirect.mockReturnValue('redirected')
    })

    it('should redirect to the welcome page', async () => {
      const run = () =>
        getUser(request, { authenticator, userFinder, redirect })
      return expect(run).rejects.toEqual('redirected')
    })
  })
})
