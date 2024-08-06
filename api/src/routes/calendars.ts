import { zValidator } from "@hono/zod-validator"
import { CalendarChooser } from "src/services/calendars/chooser"
import { CalendarListFetcher } from "src/services/calendars/list-fetcher"
import { z } from "zod"
import { newHono } from "./util"

export const CalendarsRouter = newHono()

CalendarsRouter.get("/", async (c) => {
  const svc = new CalendarListFetcher(c)
  const account = c.var.activeAccount
  if (!account) return c.json([])
  const result = await svc.call(account)

  if (!result.success) {
    return c.json({ error: result.code }, 500)
  }

  return c.json(result.data)
})

CalendarsRouter.post(
  "/:calendarId/choose",
  zValidator(
    "param",
    z.object({
      calendarId: z.string().min(1),
    }),
  ),
  async (c) => {
    const id = c.req.param("calendarId")
    const svc = new CalendarChooser(c)
    const result = await svc.call(id)

    if (!result.success) {
      return c.json({ error: result.code }, 500)
    }

    return c.json({ success: true })
  },
)
