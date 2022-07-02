import { Provider, UserWithAccount } from '../types'

export const findAccount = (user: UserWithAccount, provider: Provider) => {
  return user.account.find((account) => account.provider === provider)
}
