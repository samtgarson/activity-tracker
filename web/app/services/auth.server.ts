// app/services/auth.server.ts
import { Authenticator } from 'remix-auth'
import { GoogleStrategy } from 'remix-auth-google'
import { UserWithAccount } from '../types'
import { assertEnv } from '../utils/env'
import { sessionStorage } from './session.server'
import { UserAuthenticator } from './users/authenticator'
import { ProfileParser } from './users/authenticator/profile-parser'

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
      const [userAttrs, accountAttrs] = parser.call('google', res)

      return userAuthenticator.call(userAttrs, accountAttrs)
    }
  )
)
