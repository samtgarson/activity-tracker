import { z } from 'zod'
import { Calendar, CalendarEvent } from '../types'

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

export const googleEventSchema = z
  .object({
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
  .transform(
    (data): CalendarEvent => ({
      id: data.id,
      title: data.summary,
      description: data.description,
      start: new Date(data.start.dateTime),
      end: data.end ? new Date(data.end.dateTime) : undefined,
      transparent: data.transparency === 'transparent',
      url: data.htmlLink
    })
  )

export const googleEventListSchema = z.object({
  items: z.array(googleEventSchema)
})
