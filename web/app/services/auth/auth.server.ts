// app/services/auth.server.ts
import { UserWithAccount } from '@/app/types'
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

export const authenticator = new Authenticator<UserWithAccount>(sessionStorage)

authenticator.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleRedirectUrl,
      scope: 'profile email https://www.googleapis.com/auth/calendar',
      accessType: 'offline'
    },
    (res) => {
      const parserResult = parser.call('google', res)
      if (parserResult.error !== undefined) {
        console.error(parserResult.error)
        throw new Error(parserResult.error)
      }
      const [userAttrs, accountAttrs] = parserResult.data

      return userAuthenticator.call(userAttrs, accountAttrs)
    }
  )
)
