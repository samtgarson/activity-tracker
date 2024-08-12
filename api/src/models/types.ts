import type { User } from "@prisma/client"

export enum Provider {
  Google = "google",
}

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
  allDay: boolean
  transparent?: boolean
  url?: string
}

export interface ProfileAttributes
  extends Pick<
    User,
    "displayName" | "givenName" | "familyName" | "picture" | "id"
  > {
  email: string
}
