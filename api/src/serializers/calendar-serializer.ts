import { Calendar } from "src/models/types"

export function serializeCalendar(
  calendar: Calendar,
  account: { email: string },
) {
  return { ...calendar, accountId: account.email }
}
