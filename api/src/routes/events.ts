import { zValidator } from "@hono/zod-validator"
import { sort } from "radash"
import { apiDate } from "src/gateways/contracts"
import { serializeEvent } from "src/serializers/event-serializer"
import { EventListFetcher } from "src/services/events/list-fetcher"
import { organize } from "src/services/util/organize"
import { z } from "zod"
import { newHono } from "./util"

export const EventsRouter = newHono()

EventsRouter.get(
  "/",
  zValidator(
    "query",
    z.object({
      from: apiDate.optional(),
      to: apiDate.optional(),
    }),
  ),
  async (c) => {
    const svc = new EventListFetcher(c)
    const result = await organize(
      c.var.ctx.accounts,
      (acc) => svc.call(acc, c.req.valid("query")),
      ({ email }) => email,
    )

    if (!result.success) {
      return c.json({ error: result.code }, 500)
    }

    const flattened = Object.entries(result.data).flatMap(([email, events]) =>
      events.map((e) => serializeEvent(e, { email })),
    )
    return c.json(sort(flattened, (e) => e.start.getTime()))
  },
)
