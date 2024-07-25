import type { Account, User } from "@prisma/client"

export enum Provider {
  Google = "google",
}

export type UserWithAccount = User & { account: Account[] }
export type { Account }

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
