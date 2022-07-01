import type { Provider, User, Account } from '@prisma/client'

export type UserWithAccount = User & { account: Account[] }
export type { Provider, User, Account }

export type ServiceResult<T, ET = undefined> =
  | { data: T; error?: undefined }
  | { error: string; data?: ET }

export type Calendar = {
  color: string
  id: string
  description?: string
  writeAccess: boolean
}
