import { CalendarEvent } from "src/models/types"

export function serializeEvent(
  event: CalendarEvent,
  account: { email: string },
) {
  return { ...event, accountId: account.email }
}
