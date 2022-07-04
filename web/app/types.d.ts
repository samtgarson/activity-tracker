import type { Provider, User, Account } from '@prisma/client'

export type UserWithAccount = User & { account: Account[] }
export type { Provider, Account }

type ServiceResultSuccess<T> = { data: T; error?: undefined }
type ServiceResultError<T> = { error: string; data?: T }
export type ServiceResult<T, ET = undefined> =
  | ServiceResultSuccess<T>
  | ServiceResultError<ET>

export type Calendar = {
  color: string
  id: string
  description?: string
  writeAccess: boolean
  title: string
}
