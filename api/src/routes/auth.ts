import { zValidator } from "@hono/zod-validator"
import { Provider } from "src/models/types"
import { AuthGetRedirect } from "src/services/auth/get-redirect"
import {
  AuthHandleCallback,
  oAuthCallbackSchema,
} from "src/services/auth/handle-callback"
import { z } from "zod"
import { newHono } from "./util"

export const AuthRouter = newHono()

const providerSchema = zValidator(
  "param",
  z.object({ provider: z.nativeEnum(Provider) }),
)

AuthRouter.get("/login/:provider", providerSchema, async (c) => {
  const provider = c.req.valid("param").provider
  const svc = new AuthGetRedirect(c)
  const result = await svc.call(provider)

  if (result.success) {
    return c.redirect(result.data)
  } else {
    return c.json({ error: result.code, data: result.data }, 500)
  }
})

AuthRouter.get(
  "/callback/:provider",
  providerSchema,
  zValidator("query", oAuthCallbackSchema),
  async (c) => {
    const provider = c.req.valid("param").provider
    const data = c.req.valid("query")
    const svc = new AuthHandleCallback(c)
    const result = await svc.call(provider, data)

    if (!result.success) {
      return c.json({ error: result.code, data: result.data }, 500)
    }

    return c.json({ ok: true })
  },
)
