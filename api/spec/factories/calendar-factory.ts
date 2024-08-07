import { faker } from "@faker-js/faker"
import { Calendar } from "src/models/types"

export function buildCalendar(attrs: Partial<Calendar> = {}) {
  return {
    id: faker.internet.email(),
    color: faker.color.rgb(),
    title: faker.lorem.words(2),
    writeAccess: faker.datatype.boolean(),
    description: faker.lorem.sentence(),
    ...attrs,
  } satisfies Calendar
}
