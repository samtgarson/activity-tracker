import { serializeCalendar } from "src/serializers/calendar-serializer"
import { CalendarChooser } from "src/services/calendars/chooser"
import { CalendarCreator } from "src/services/calendars/creator"
import { CalendarFetcher } from "src/services/calendars/fetcher"
import { CalendarListFetcher } from "src/services/calendars/list-fetcher"
import { organize } from "src/services/util/organize"
import { newHono } from "../util"
import { chooseRoute, createRoute, indexRoute, showRoute } from "./doc"

export const CalendarsRouter = newHono()

CalendarsRouter.openapi(indexRoute, async (c) => {
  const svc = new CalendarListFetcher(c.var.ctx)
  const result = await organize(
    c.var.ctx.accounts,
    (acc) => svc.call(acc),
    ({ email }) => email,
  )

  if (!result.success) {
    return c.json({ error: result.code }, 500)
  }

  const flattened = Object.entries(result.data).flatMap(([email, calendars]) =>
    calendars.map((c) => serializeCalendar(c, { email })),
  )
  return c.json(flattened, 200)
})

CalendarsRouter.openapi(createRoute, async function (c) {
  const { title } = c.req.valid("json")
  const accountId = c.req.valid("param").accountId
  const account = c.var.ctx.findAccount(accountId)
  if (!account) return c.json({ error: "account_not_found" as const }, 404)

  const svc = new CalendarCreator(c)
  const result = await svc.call(account, title)

  if (!result.success) {
    return c.json({ error: result.code }, 500)
  }

  return c.json(serializeCalendar(result.data, account), 201)
})

CalendarsRouter.openapi(showRoute, async (c) => {
  const id = c.req.valid("param").calendarId
  const account = c.var.ctx.findAccount(c.req.valid("param").accountId)
  if (!account) return c.json({ error: "account_not_found" as const }, 404)

  const svc = new CalendarFetcher(c)
  const result = await svc.call(account, id)

  if (!result.success) {
    return c.json({ error: result.code }, 500)
  }

  if (!result.data) {
    return c.json({ error: "calendar_not_found" as const }, 404)
  }

  return c.json(serializeCalendar(result.data, account), 200)
})

CalendarsRouter.openapi(chooseRoute, async (c) => {
  const id = c.req.valid("param").calendarId
  const account = c.var.ctx.findAccount(c.req.valid("param").accountId)
  if (!account) return c.json({ error: "account_not_found" }, 404)

  const svc = new CalendarChooser(c)
  const result = await svc.call(account, id)

  if (!result.success) {
    if (result.code === "calendar_not_found") {
      return c.json({ error: result.code }, 404)
    }

    return c.json({ error: result.code }, 500)
  }

  return c.json({ success: true }, 201)
})
