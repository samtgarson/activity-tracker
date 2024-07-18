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

export type CalendarEvent = {
  id: string
  title: string
  description?: string
  start: Date
  end?: Date
  transparent?: boolean
  url?: string
}
