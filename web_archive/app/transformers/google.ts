import { z } from 'zod'
import { googleCalendarSchema, googleEventSchema } from '../contracts/google'
import { Calendar, CalendarEvent } from '../types'

export const googleCalendarTransformer = googleCalendarSchema.transform(
  (data): Calendar => ({
    color: data.backgroundColor,
    id: data.id,
    description: data.description,
    writeAccess: ['writer', 'owner'].includes(data.accessRole),
    title: data.summaryOverride || data.summary
  })
)

export const googleCalendarListTransformer = z.object({
  items: z.array(googleCalendarTransformer)
})

export const googleEventTransformer = googleEventSchema.transform(
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

export const googleEventListTransformer = z.object({
  items: z.array(googleEventTransformer)
})
