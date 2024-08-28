import { DisconnectAccount } from "src/services/accounts/disconnect-account"
import { newHono } from "../util"
import { deleteRoute } from "./doc"

export const AccountsRouter = newHono()

AccountsRouter.openapi(deleteRoute, async (c) => {
  const svc = new DisconnectAccount(c)
  const result = await svc.call(c.req.valid("param").id)
  if (!result.success) {
    switch (result.code) {
      case "not_found":
        return c.json({ error: "not_found" }, 404)
      default:
        return c.json({ error: "server_error" }, 500)
    }
  }

  return c.body(null, 204)
})
