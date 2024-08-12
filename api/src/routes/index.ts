import { serializeAccount } from "src/serializers/account-serializer"
import { serializeUser } from "src/serializers/user-serializer"
import { AuthDecodeToken } from "src/services/auth/decode-token"
import { RefreshProviderToken } from "src/services/auth/refresh-provider-token"
import { ServiceContext } from "src/services/base"
import { organize } from "src/services/util/organize"
import { AuthRouter } from "./auth"
import { CalendarsRouter } from "./calendars"
import { EventsRouter } from "./events"
import { newHono } from "./util"

const app = newHono()

app.get("/", (c) => c.json({ message: "beep boop" }))
app.route("/auth", AuthRouter)
app.use("/*", async (c, next) => {
  const authSvc = new AuthDecodeToken(c)
  const authResult = await authSvc.call(c.req.header("Authorization"))
  if (!authResult.success) return c.json({ error: "Not authorized" }, 401)
  const { accounts, ...user } = authResult.data
  c.set("ctx", new ServiceContext(c.env, new URL(c.req.url), user, accounts))

  if (!accounts.length) return await next()

  const refreshSvc = new RefreshProviderToken(c)
  const refreshResult = await organize(accounts, (acc) => refreshSvc.call(acc))

  if (!refreshResult.success)
    return c.json({ error: "Failed to refresh token for active account" }, 500)

  c.var.ctx.accounts = refreshResult.data
  await next()
})

app.get("/me", async (c) => {
  const { user, accounts } = c.var.ctx
  return c.json({
    ...serializeUser(user),
    accounts: accounts.map(serializeAccount),
  })
})

app.route("/", CalendarsRouter)
app.route("/events", EventsRouter)

export { app }
