import { Account, Provider, UserWithAccount } from '../types'

export class User {
  public id: string
  public givenName: string
  public familyName: string
  public email: string
  public account: Account[]

  constructor({ id, givenName, familyName, email, account }: UserWithAccount) {
    this.id = id
    this.givenName = givenName
    this.familyName = familyName
    this.email = email
    this.account = account
  }

  get activeAccount(): Account | undefined {
    return this.account.find((account) => account.active)
  }

  accountFor(provider: Provider) {
    return this.account.find((account) => account.provider === provider)
  }
}
