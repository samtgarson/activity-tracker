import { zValidator } from "@hono/zod-validator"
import { apiDate } from "src/gateways/contracts"
import { EventListFetcher } from "src/services/events/list-fetcher"
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
    const result = await svc.call(c.req.valid("query"))

    if (!result.success) {
      return c.json({ error: result.code }, 500)
    }

    return c.json(result.data)
  },
)
