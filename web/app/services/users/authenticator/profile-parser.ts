import { Provider, ServiceResult } from '@/app/types'
import { GoogleExtraParams, GoogleProfile } from 'remix-auth-google'
import { OAuth2StrategyVerifyParams } from 'remix-auth-oauth2'
import { AccountAttrs, UserAttrs } from '.'

export type ProfileParserResult = [UserAttrs, AccountAttrs]

export class ProfileParser {
  call(
    provider: 'google',
    profile: OAuth2StrategyVerifyParams<GoogleProfile, GoogleExtraParams>
  ): ServiceResult<ProfileParserResult>
  call(
    provider: Provider,
    profile: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ): ServiceResult<ProfileParserResult> {
    switch (provider) {
      case 'google':
        return { data: this.parseGoogle(profile) }
      default:
        return { error: `Unsupported provider: ${provider}` }
    }
  }

  private parseGoogle(
    profile: OAuth2StrategyVerifyParams<GoogleProfile, GoogleExtraParams>
  ): ProfileParserResult {
    const {
      refreshToken,
      profile: {
        id: remoteId,
        displayName,
        name: { givenName, familyName },
        emails: [{ value: email }],
        photos: [{ value: picture }]
      }
    } = profile

    return [
      { displayName, givenName, familyName, email, picture },
      { remoteId, refreshToken, provider: 'google' }
    ]
  }
}
