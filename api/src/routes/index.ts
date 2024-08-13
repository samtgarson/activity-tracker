import { serializeAccount } from "src/serializers/account-serializer"
import { serializeUser } from "src/serializers/user-serializer"
import { AuthRouter } from "./auth"
import { CalendarsRouter } from "./calendars"
import { EventsRouter } from "./events"
import { newHono } from "./util"
import { authenticate } from "./util/auth-middleware"

const app = newHono()

app.get("/", (c) => c.json({ message: "beep boop" }))
app.route("/auth", AuthRouter)
app.use("/*", authenticate)

app.get("/me", async (c) => {
  const { user, accounts } = c.var.ctx
  return c.json({
    ...serializeUser(user),
    accounts: accounts.map(serializeAccount),
  })
})

app.route("/", CalendarsRouter)
app.route("/", EventsRouter)

export { app }
