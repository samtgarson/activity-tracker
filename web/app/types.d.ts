import type { Provider, User, Account } from '@prisma/client'

export type UserWithAccount = User & { account: Account[] }
export type { Provider, Account }

export type Calendar = {
  color: string
  id: string
  description?: string
  writeAccess: boolean
  title: string
}
