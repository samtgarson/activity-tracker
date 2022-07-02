// app/services/auth.server.ts
import { UserWithAccount } from '@/app/types'
import { Authenticator } from 'remix-auth'
import { GoogleStrategy } from 'remix-auth-google'
import { assertEnv } from '@/app/utils/env'
import { sessionStorage } from './session.server'
import { UserAuthenticator } from '@/app/services/users/authenticator'
import { ProfileParser } from '@/app/services/users/authenticator/profile-parser'

assertEnv(process.env.GOOGLE_CLIENT_ID)
assertEnv(process.env.GOOGLE_CLIENT_SECRET)
assertEnv(process.env.BASE_URL)

const parser = new ProfileParser()
const userAuthenticator = new UserAuthenticator()

export const authenticator = new Authenticator<UserWithAccount>(sessionStorage)

authenticator.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BASE_URL + '/auth/google/callback',
      scope: 'profile email https://www.googleapis.com/auth/calendar'
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
