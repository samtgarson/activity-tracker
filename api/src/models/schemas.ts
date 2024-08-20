import { z } from "@hono/zod-openapi"
import { Provider } from "./types"

export const eventSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    start: z.date(),
    end: z.date().optional(),
    allDay: z.boolean(),
    transparent: z.boolean(),
    url: z.string().url().optional(),
    accountId: z.string(),
  })
  .openapi("Event")

export const calendarSchema = z
  .object({
    color: z.string(),
    id: z.string(),
    description: z.string().optional(),
    writeAccess: z.boolean(),
    title: z.string(),
    accountId: z.string(),
  })
  .openapi("Calendar")

export const providerSchema = z.nativeEnum(Provider).openapi("Provider")

export const accountSchema = z
  .object({
    id: z.string(),
    provider: providerSchema,
    createdAt: z.date(),
    calendarId: z.string().nullable(),
    active: z.boolean(),
  })
  .openapi("Account")

export const userSchema = z
  .object({
    id: z.string(),
    createdAt: z.date(),
    givenName: z.string(),
    familyName: z.string(),
    displayName: z.string(),
    picture: z.string().url().nullable(),
    accounts: z.array(accountSchema),
  })
  .openapi("User")
