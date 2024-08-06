import { AuthDecodeToken } from "src/services/auth/decode-token"
import { RefreshProviderToken } from "src/services/auth/refresh-provider-token"
import { AuthRouter } from "./auth"
import { CalendarsRouter } from "./calendars"
import { newHono } from "./util"

const app = newHono()

app.get("/", (c) => c.json({ message: "beep boop" }))
app.route("/auth", AuthRouter)
app.use("/*", async (c, next) => {
  try {
    const authSvc = new AuthDecodeToken(c)
    const authResult = await authSvc.call(c.req.header("Authorization"))
    if (!authResult.success) return c.json({ error: "Not authorized" }, 401)
    c.set("user", authResult.data)

    const activeAccount = await authResult.data.activeAccount
    if (!activeAccount) return await next()

    const refreshSvc = new RefreshProviderToken(c)
    const refreshResult = await refreshSvc.call(activeAccount)
    if (!refreshResult.success)
      return c.json(
        { error: "Failed to refresh token for active account" },
        500,
      )
    c.set("activeAccount", refreshResult.data)

    await next()
  } catch (e) {
    console.error(e)
    return c.json({ error: "Internal server error" }, 500)
  }
})
app.get("/me", async (c) => {
  const { activeAccount, accountFor, ...user } = c.get("user")
  const account = c.get("activeAccount")
  return c.json({ ...user, activeProvider: account?.provider })
})

app.route("/calendars", CalendarsRouter)

export { app }
