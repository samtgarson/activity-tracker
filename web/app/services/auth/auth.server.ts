// app/services/auth.server.ts
import { Authenticator } from 'remix-auth'
import { GoogleStrategy } from 'remix-auth-google'
import { sessionStorage } from './session.server'
import { UserAuthenticator } from '@/app/services/users/authenticator'
import { ProfileParser } from '@/app/services/users/authenticator/profile-parser'
import {
  googleClientId,
  googleClientSecret,
  googleRedirectUrl
} from './providers/google.server'

const parser = new ProfileParser()
const userAuthenticator = new UserAuthenticator()

export type AuthenticatorResult = { userId: string }
export const authenticator = new Authenticator<AuthenticatorResult>(
  sessionStorage
)

authenticator.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleRedirectUrl,
      scope: 'profile email https://www.googleapis.com/auth/calendar',
      accessType: 'offline'
    },
    async (res) => {
      const parserResult = parser.call('google', res)
      if (parserResult.error !== undefined) {
        console.error(parserResult.error)
        throw new Error(parserResult.error)
      }
      const [userAttrs, accountAttrs] = parserResult.data

      const user = await userAuthenticator.call(userAttrs, accountAttrs)
      return { userId: user.id }
    }
  )
)
