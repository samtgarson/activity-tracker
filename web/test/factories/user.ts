import { Account, UserWithAccount } from '@/app/types'
import { Factory } from 'fishery'

export const accountFactory = Factory.define<Account>(({ sequence }) => ({
  provider: 'google',
  remoteId: `google-${sequence}`,
  refreshToken: 'refreshToken',
  id: `account-${sequence}`,
  userId: `user-${sequence}`,
  createdAt: new Date()
}))

export const userFactory = Factory.define<UserWithAccount>(({ sequence }) => ({
  id: `user-${sequence}`,
  email: `email-${sequence}@example.com`,
  displayName: `User${sequence} Surname`,
  givenName: `User${sequence}`,
  familyName: 'Surname',
  picture: 'https://example.com/picture.jpg',
  createdAt: new Date(),
  account: accountFactory.buildList(1)
}))
