import { z } from 'zod'
import { Calendar } from '../types'

export const googleCalendarSchema = z
  .object({
    accessRole: z.enum(['owner', 'writer', 'reader']),
    backgroundColor: z.string(),
    foregroundColor: z.string(),
    description: z.string().optional(),
    summary: z.string(),
    summaryOverride: z.string().optional(),
    id: z.string()
  })
  .transform(
    (data): Calendar => ({
      color: data.backgroundColor,
      id: data.id,
      description: data.description,
      writeAccess: ['writer', 'owner'].includes(data.accessRole),
      title: data.summaryOverride || data.summary
    })
  )

export const googleCalendarListSchema = z.object({
  items: z.array(googleCalendarSchema)
})
