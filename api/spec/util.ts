import { D1Database } from "@cloudflare/workers-types"
import { Hono } from "hono"
import { Ctx, newHono } from "src/routes/util"
import { ServiceContext } from "src/services/base"
import { buildAccount } from "./factories/account-factory"
import { buildUser } from "./factories/user-factory"

const activeAccount = buildAccount()
const user = buildUser({ activeAccount: Promise.resolve(activeAccount) })
export const mockContext = {
  env: {
    GOOGLE_CLIENT_ID: "123",
    GOOGLE_CLIENT_SECRET: "456",
    JWT_SECRET: "789",
    DB: {} as unknown as D1Database,
  },
  url: new URL("http://localhost"),
  user,
  activeAccount,
} satisfies ServiceContext

const AuthedRouter = newHono()
AuthedRouter.use(async (c, next) => {
  c.set("user", user)
  c.set("activeAccount", activeAccount)
  return next()
})

export function withAuth<H extends Hono<Ctx>>(router: H) {
  AuthedRouter.route("/", router)
  return AuthedRouter
}
