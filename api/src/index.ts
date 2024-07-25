import { AuthRouter } from "./routes/auth"
import { newHono } from "./routes/util"

const app = newHono()

app.get("/", (c) => c.json({ message: "beep boop" }))
app.route("/auth", AuthRouter)

export default app
