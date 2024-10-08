import { Calendar, CalendarEvent, ProfileAttributes } from "src/models/types"
import { z } from "zod"
import { flexibleDate } from "."

export const googleCalendarSchema = z
  .object({
    accessRole: z.enum(["owner", "writer", "reader"]).optional(),
    backgroundColor: z.string(),
    foregroundColor: z.string(),
    description: z.string().optional(),
    summary: z.string(),
    summaryOverride: z.string().optional(),
    id: z.string(),
  })
  .transform(
    (data): Calendar => ({
      color: data.backgroundColor,
      id: data.id,
      description: data.description,
      writeAccess: data.accessRole
        ? ["writer", "owner"].includes(data.accessRole)
        : false,
      title: data.summaryOverride || data.summary,
    }),
  )

export const googleCalendarListSchema = z
  .object({
    items: z.array(googleCalendarSchema),
  })
  .transform((data) => data.items)

const googleEventDateTimeSchema = z
  .object({
    date: flexibleDate,
    dateTime: z.never().optional(),
  })
  .or(
    z.object({
      dateTime: flexibleDate,
      date: z.never().optional(),
    }),
  )
  .transform((data) => ({
    dateTime: data.date || data.dateTime,
    allDay: !!data.date,
  }))

export const googleEventSchema = z
  .object({
    id: z.string(),
    status: z.enum(["confirmed", "tentative", "cancelled"]),
    htmlLink: z.string(),
    summary: z.string(),
    description: z.string().optional(),
    start: googleEventDateTimeSchema,
    end: googleEventDateTimeSchema.optional(),
    transparency: z.enum(["opaque", "transparent"]).optional(),
  })
  .transform(
    (data): CalendarEvent => ({
      id: data.id,
      title: data.summary,
      description: data.description,
      start: data.start.dateTime,
      end: data.end?.dateTime,
      allDay: data.start.allDay,
      transparent: data.transparency === "transparent",
      url: data.htmlLink,
    }),
  )

export const googleEventListSchema = z
  .object({
    items: z.array(googleEventSchema),
  })
  .transform((data) => data.items)

const googlePeopleMetadataSchema = z.object({
  metadata: z.object({
    primary: z.boolean().optional(),
  }),
})

function findPrimary<T extends z.infer<typeof googlePeopleMetadataSchema>>(
  items: T[],
): T {
  const found = items.find((item) => item.metadata.primary)
  if (!found) throw new Error(`Could not find primary field`)
  return found
}

export const googleProfileSchema = z
  .object({
    resourceName: z.string(),
    names: z.array(
      z.object({
        ...googlePeopleMetadataSchema.shape,
        displayName: z.string(),
        familyName: z.string(),
        givenName: z.string(),
      }),
    ),
    emailAddresses: z.array(
      z.object({
        ...googlePeopleMetadataSchema.shape,
        value: z.string(),
      }),
    ),
    photos: z.array(
      z.object({
        ...googlePeopleMetadataSchema.shape,
        url: z.string(),
      }),
    ),
  })
  .transform(
    (data): ProfileAttributes => ({
      id: data.resourceName,
      displayName: findPrimary(data.names).displayName,
      familyName: findPrimary(data.names).familyName,
      givenName: findPrimary(data.names).givenName,
      email: findPrimary(data.emailAddresses).value,
      picture: findPrimary(data.photos).url,
    }),
  )
