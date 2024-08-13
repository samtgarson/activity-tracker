import type { User } from "@prisma/client"
import { z } from "zod"
import { calendarSchema, eventSchema } from "./schemas"

export enum Provider {
  Google = "google",
}

export type Calendar = Omit<z.infer<typeof calendarSchema>, "accountId">
export type CalendarEvent = Omit<z.infer<typeof eventSchema>, "accountId">

export interface ProfileAttributes
  extends Pick<
    User,
    "displayName" | "givenName" | "familyName" | "picture" | "id"
  > {
  email: string
}
