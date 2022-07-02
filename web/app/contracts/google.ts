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
export type GoogleCalendar = z.infer<typeof googleCalendarSchema>

export const googleCalendarListSchema = z.object({
  items: z.array(googleCalendarSchema)
})
export type GoogleCalendarList = z.infer<typeof googleCalendarListSchema>
