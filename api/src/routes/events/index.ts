import { sort } from "radash"
import { serializeEvent } from "src/serializers/event-serializer"
import { EventListFetcher } from "src/services/events/list-fetcher"
import { organize } from "src/services/util/organize"
import { newHono } from "../util"
import { route } from "./doc"

export const EventsRouter = newHono()

EventsRouter.openapi(route, async (c) => {
  const svc = new EventListFetcher(c)
  const result = await organize(
    c.var.ctx.accounts,
    (acc) => svc.call(acc, c.req.valid("query")),
    ({ id }) => id,
  )

  if (!result.success) {
    return c.json({ error: result.code }, 500)
  }

  const flattened = Object.entries(result.data).flatMap(([id, events]) =>
    events.map((e) => serializeEvent(e, { id })),
  )
  return c.json(
    sort(flattened, (e) => e.start.getTime()),
    200,
  )
})
