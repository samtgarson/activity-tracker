import { Account, UserWithAccount } from '@/app/types'
import { Factory } from 'fishery'

export const accountFactory = Factory.define<Account>(({ sequence }) => ({
  provider: 'google',
  remoteId: `google-${sequence}`,
  refreshToken: 'refreshToken',
  id: `account-${sequence}`,
  userId: `user-${sequence}`,
  createdAt: new Date(),
  active: false,
  calendarId: null
}))

class UserFactory extends Factory<UserWithAccount> {
  public active() {
    return this.params({
      account: accountFactory.buildList(1, {
        active: true,
        calendarId: 'activeCalendarId'
      })
    })
  }
}

export const userFactory = UserFactory.define(({ sequence }) => ({
  id: `user-${sequence}`,
  email: `email-${sequence}@example.com`,
  displayName: `User${sequence} Surname`,
  givenName: `User${sequence}`,
  familyName: 'Surname',
  picture: 'https://example.com/picture.jpg',
  createdAt: new Date(),
  account: accountFactory.buildList(1)
}))
