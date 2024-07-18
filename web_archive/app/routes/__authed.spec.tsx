import { userFactory } from '@/test/factories/user'
import { User } from '../models/user'
import { loader } from './__authed'

const getUser = vi.fn()
const json = vi.fn(() => new Response())
const redirect = vi.fn()
const deps = { getUser, json, redirect }
const context = {}
const params = {}

describe('Authed route loader', () => {
  describe('when user has an active calendar', () => {
    const user = new User(userFactory.active().build())
    const request = new Request('http://localhost:5000/')

    beforeEach(() => {
      getUser.mockResolvedValue(user)
    })

    it('should render the user as json', async () => {
      const res = await loader({ request, context, params }, deps)

      expect(json).toHaveBeenCalledWith({ user })
      expect(res).toEqual(json())
    })
  })

  describe('when user has no active calendar', () => {
    const user = new User(userFactory.build())
    const request = new Request('http://localhost:5000/')

    beforeEach(() => {
      getUser.mockResolvedValue(user)
    })

    it('should redirect to welcome', async () => {
      const res = await loader({ request, context, params }, deps)

      expect(redirect).toHaveBeenCalledWith('/welcome')
      expect(res).toEqual(redirect())
    })

    describe('and the request is for the welcome page', () => {
      const request = new Request('http://localhost:5000/welcome')

      it('should render the user as json', async () => {
        const res = await loader({ request, context, params }, deps)

        expect(json).toHaveBeenCalledWith({ user })
        expect(res).toEqual(json())
      })
    })
  })
})
