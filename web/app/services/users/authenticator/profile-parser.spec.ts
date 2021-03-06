import { googleProfileFactory } from '@/test/factories/google'
import { ProfileParser } from './profile-parser'

describe('Profile Parser', () => {
  let parser: ProfileParser

  beforeEach(() => {
    parser = new ProfileParser()
  })

  describe('for a google profile', () => {
    it('should return the correct data', async () => {
      const profile = googleProfileFactory.build()
      const result = await parser.call({ provider: 'google', profile })

      expect(result).toEqual({
        success: true,
        data: [
          {
            email: profile.profile.emails[0].value,
            displayName: profile.profile.displayName,
            givenName: profile.profile.name.givenName,
            familyName: profile.profile.name.familyName,
            picture: profile.profile.photos[0].value
          },
          {
            remoteId: profile.profile.id,
            refreshToken: profile.refreshToken,
            provider: 'google'
          }
        ]
      })
    })
  })
})
