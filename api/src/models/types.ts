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

export type ProfileAttributes = Pick<
  User,
  "email" | "displayName" | "givenName" | "familyName" | "picture" | "id"
>
