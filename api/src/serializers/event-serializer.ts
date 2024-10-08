import { eventSchema } from "src/models/schemas"
import { CalendarEvent } from "src/models/types"
import { z } from "zod"

export function serializeEvent(
  event: CalendarEvent,
  account: { id: string },
): z.infer<typeof eventSchema> {
  return { ...event, accountId: account.id }
}
