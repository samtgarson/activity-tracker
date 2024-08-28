import { swaggerUI } from "@hono/swagger-ui"
import { serializeUser } from "src/serializers/user-serializer"
import { AccountsRouter } from "./accounts"
import { AuthRouter } from "./auth"
import { CalendarsRouter } from "./calendars"
import { docConfig, meRoute, pingRoute } from "./doc"
import { EventsRouter } from "./events"
import { newHono } from "./util"
import { authenticate, requireAuthentication } from "./util/auth-middleware"

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
app.doc("/doc", docConfig)

app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
})

app.use("/*", authenticate)
app.route("/", AuthRouter)
app.use("/*", requireAuthentication)

app.openapi(meRoute, async function (c) {
  const { user, accounts } = c.var.ctx
  return c.json(serializeUser(user, accounts))
})

app.route("/", CalendarsRouter)
app.route("/", EventsRouter)
app.route("/", AccountsRouter)

export { app }
