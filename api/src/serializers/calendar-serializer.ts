import { calendarSchema } from "src/models/schemas"
import { Calendar } from "src/models/types"
import { z } from "zod"

export function serializeCalendar(
  calendar: Calendar,
  account: { id: string },
): z.infer<typeof calendarSchema> {
  return { ...calendar, accountId: account.id }
}
