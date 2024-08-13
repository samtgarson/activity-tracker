import { z } from "@hono/zod-openapi"

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
