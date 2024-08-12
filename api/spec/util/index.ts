import { D1Database } from "@cloudflare/workers-types"
import { Hono } from "hono"
import { buildAccount } from "spec/factories/account-factory"
import { buildUser } from "spec/factories/user-factory"
import { Ctx, newHono } from "src/routes/util"
import { ServiceContext } from "src/services/base"

const account = { ...buildAccount(), calendarId: "123" }
const user = buildUser()
export const mockContext = new ServiceContext(
  {
    GOOGLE_CLIENT_ID: "123",
    GOOGLE_CLIENT_SECRET: "456",
    JWT_SECRET: "789",
    DB: {} as unknown as D1Database,
  },
  new URL("http://localhost"),
  user,
  [account],
)

const AuthedRouter = newHono()
AuthedRouter.use(async (c, next) => {
  c.set("ctx", mockContext)
  return next()
})

export function withAuth<H extends Hono<Ctx>>(router: H) {
  AuthedRouter.route("/", router)
  return AuthedRouter
}
