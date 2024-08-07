import { zValidator } from "@hono/zod-validator"
import { CalendarChooser } from "src/services/calendars/chooser"
import { CalendarCreator } from "src/services/calendars/creator"
import { CalendarFetcher } from "src/services/calendars/fetcher"
import { CalendarListFetcher } from "src/services/calendars/list-fetcher"
import { z } from "zod"
import { newHono } from "./util"

export const CalendarsRouter = newHono()

CalendarsRouter.get("/", async (c) => {
  const svc = new CalendarListFetcher(c)
  const account = c.var.activeAccount
  if (!account) return c.json([])
  const result = await svc.call()

  if (!result.success) {
    return c.json({ error: result.code }, 500)
  }

  return c.json(result.data)
})

CalendarsRouter.post(
  "/",
  zValidator("json", z.object({ title: z.string().min(1) })),
  async function (c) {
    const { title } = c.req.valid("json")
    const svc = new CalendarCreator(c)
    const result = await svc.call(title)

    if (!result.success) {
      return c.json({ error: result.code }, 500)
    }

    return c.json(result.data, 201)
  },
)

CalendarsRouter.get(
  "/:calendarId",
  zValidator(
    "param",
    z.object({
      calendarId: z.string().min(1),
    }),
  ),
  async (c) => {
    const id = c.req.valid("param").calendarId
    const svc = new CalendarFetcher(c)
    const result = await svc.call(id)

    if (!result.success) {
      return c.json({ error: result.code }, 500)
    }

    return c.json(result.data)
  },
)

CalendarsRouter.post(
  "/:calendarId/choose",
  zValidator(
    "param",
    z.object({
      calendarId: z.string().min(1),
    }),
  ),
  async (c) => {
    const id = c.req.valid("param").calendarId
    const svc = new CalendarChooser(c)
    const result = await svc.call(id)

    if (!result.success) {
      return c.json({ error: result.code }, 500)
    }

    return c.json({ success: true })
  },
)
