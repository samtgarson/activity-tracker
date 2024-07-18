import { Service } from '@/app/utils/service'
import { GoogleExtraParams, GoogleProfile } from 'remix-auth-google'
import { OAuth2StrategyVerifyParams } from 'remix-auth-oauth2'
import { AccountAttrs, UserAttrs } from '.'

export type ProfileParserResult = [UserAttrs, AccountAttrs]

type ProfileParserParams = {
  provider: 'google'
  profile: OAuth2StrategyVerifyParams<GoogleProfile, GoogleExtraParams>
}

export class ProfileParser extends Service<ProfileParserResult> {
  async call({ provider, profile }: ProfileParserParams) {
    switch (provider) {
      case 'google':
        return this.success(this.parseGoogle(profile))
    }
  }

  private parseGoogle(
    profile: ProfileParserParams['profile']
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
