// app/services/auth.server.ts
import { Authenticator } from 'remix-auth'
import { GoogleStrategy } from 'remix-auth-google'
import { User } from '../types'
import { assertEnv } from '../utils/env'
import { sessionStorage } from './session.server'

assertEnv(process.env.GOOGLE_CLIENT_ID)
assertEnv(process.env.GOOGLE_CLIENT_SECRET)
assertEnv(process.env.BASE_URL)

export const authenticator = new Authenticator<User>(sessionStorage)

authenticator.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BASE_URL + '/auth/google/callback'
    },
    async (res) => {
      const {
        accessToken,
        profile: {
          displayName,
          name: { givenName, familyName },
          emails: [{ value: email }],
          photos: [{ value: picture }]
        }
      } = res

      return { displayName, givenName, familyName, email, picture, accessToken }
    }
  )
)
