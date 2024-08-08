import { faker } from "@faker-js/faker"
import { CalendarEvent } from "src/models/types"

export function buildEvent(attrs: Partial<CalendarEvent> = {}) {
  const start = faker.date.recent()
  const end = new Date(start.getTime() + 30 * 60 * 1000) // 30 minutes later

  return {
    id: faker.internet.email(),
    start,
    end,
    url: faker.internet.url(),
    title: faker.lorem.words(2),
    description: faker.lorem.sentence(),
    allDay: faker.datatype.boolean(),
    ...attrs,
  } satisfies CalendarEvent
}
