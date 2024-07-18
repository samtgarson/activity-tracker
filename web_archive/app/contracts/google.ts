import { z } from 'zod'

export const googleCalendarSchema = z.object({
  accessRole: z.enum(['owner', 'writer', 'reader']),
  backgroundColor: z.string(),
  foregroundColor: z.string(),
  description: z.string().optional(),
  summary: z.string(),
  summaryOverride: z.string().optional(),
  id: z.string()
})

export const googleEventSchema = z.object({
  id: z.string(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']),
  htmlLink: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  start: z.object({
    dateTime: z.string()
  }),
  end: z.object({
    dateTime: z.string()
  }),
  transparency: z.enum(['opaque', 'transparent']).optional()
})

export type GoogleCalendar = z.infer<typeof googleCalendarSchema>
export type GoogleEvent = z.infer<typeof googleEventSchema>
