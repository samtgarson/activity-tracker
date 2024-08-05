import { AuthRouter } from "./routes/auth"
import { CalendarsRouter } from "./routes/calendars"
import { newHono } from "./routes/util"
import { AuthDecodeToken } from "./services/auth/decode-token"

const app = newHono()

app.get("/", (c) => c.json({ message: "beep boop" }))
app.route("/auth", AuthRouter)
app.use("/*", async (c, next) => {
  const svc = new AuthDecodeToken(c)
  const result = await svc.call(c.req.header("Authorization"))
  if (!result.success) return c.json({ error: "Not authorized" }, 401)

  c.set("user", result.data)
  await next()
})

app.route("/calendars", CalendarsRouter)

export default app
