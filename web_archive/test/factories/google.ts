import { GoogleCalendar } from '@/app/contracts/google'
import { Factory } from 'fishery'
import { GoogleExtraParams, GoogleProfile } from 'remix-auth-google'
import { OAuth2StrategyVerifyParams } from 'remix-auth-oauth2'

export const googleCalendarFactory = Factory.define<GoogleCalendar>(
  ({ sequence }) => ({
    accessRole: 'owner',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    description: 'A calendar for me',
    summary: 'My Calendar',
    summaryOverride: undefined,
    id: `calendar-${sequence}`
  })
)

export const googleProfileFactory = Factory.define<
  OAuth2StrategyVerifyParams<GoogleProfile, GoogleExtraParams>
>(({ sequence }) => ({
  accessToken: `accessToken-${sequence}`,
  refreshToken: `refreshToken-${sequence}`,
  profile: {
    id: `id-${sequence}`,
    displayName: `User${sequence} Surname`,
    name: { givenName: `User${sequence}`, familyName: 'Surname' },
    emails: [{ value: `email-${sequence}@example.com` }],
    photos: [{ value: 'https://example.com/picture.jpg' }]
  } as GoogleProfile,
  extraParams: {} as GoogleExtraParams
}))
