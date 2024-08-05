import { CalendarListFetcher } from "src/services/calendars/list-fetcher"
import { newHono } from "./util"

export const CalendarsRouter = newHono()

CalendarsRouter.get("/", async (c) => {
  const svc = new CalendarListFetcher(c)
  const result = await svc.call(c.get("user"))

  if (!result.success) {
    return c.json({ error: result.code }, 500)
  }

  return c.json(result.data)
})
