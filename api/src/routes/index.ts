import { swaggerUI } from "@hono/swagger-ui"
import { serializeAccount } from "src/serializers/account-serializer"
import { serializeUser } from "src/serializers/user-serializer"
import { AuthRouter } from "./auth"
import { CalendarsRouter } from "./calendars"
import { meRoute, pingRoute } from "./doc"
import { EventsRouter } from "./events"
import { newHono } from "./util"
import { authenticate } from "./util/auth-middleware"

const app = newHono()

app.openapi(pingRoute, async function (c) {
  return c.json({ beep: "boop" as const })
})
app.get(
  "/ui",
  swaggerUI({
    url: "/doc",
  }),
)
app.doc("/doc", {
  info: {
    title: "Activity Tracker API",
    version: "v0.01",
  },
  openapi: "3.1.0",
})

app.route("/", AuthRouter)
app.use("/*", authenticate)

app.openapi(meRoute, async function (c) {
  const { user, accounts } = c.var.ctx
  return c.json({
    ...serializeUser(user),
    accounts: accounts.map(serializeAccount),
  })
})

app.route("/", CalendarsRouter)
app.route("/", EventsRouter)

export { app }
