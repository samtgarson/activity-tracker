import { z } from 'zod'

export const calendarSchema = z.object({
  accessRole: z.enum(['owner', 'writer', 'reader']),
  backgroundColor: z.string(),
  foregroundColor: z.string(),
  description: z.string().optional(),
  summary: z.string(),
  summaryOverride: z.string().optional(),
  id: z.string()
})
export type Calendar = z.infer<typeof calendarSchema>

export const calendarListSchema = z.object({ items: z.array(calendarSchema) })
export type CalendarList = z.infer<typeof calendarListSchema>
