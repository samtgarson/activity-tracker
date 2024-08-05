import { zValidator } from "@hono/zod-validator"
import { oAuthCallbackParamsSchema } from "src/gateways/contracts/oauth"
import { Provider } from "src/models/types"
import { AuthGetRedirect } from "src/services/auth/get-redirect"
import { AuthHandleCallback } from "src/services/auth/handle-callback"
import { AuthRefreshAccessToken } from "src/services/auth/refresh-access-token"
import { z } from "zod"
import { newHono } from "./util"

export const AuthRouter = newHono()

const providerSchema = zValidator(
  "param",
  z.object({ provider: z.nativeEnum(Provider) }),
)

AuthRouter.get("/login/:provider", providerSchema, async (c) => {
  const provider = c.req.valid("param").provider
  const svc = new AuthGetRedirect(c, provider)
  const result = await svc.call()

  if (result.success) {
    return c.redirect(result.data)
  } else {
    return c.json({ error: result.code, data: result.data }, 500)
  }
})

AuthRouter.get(
  "/callback/:provider",
  providerSchema,
  zValidator("query", oAuthCallbackParamsSchema),
  async (c) => {
    const provider = c.req.valid("param").provider
    const data = c.req.valid("query")
    const svc = new AuthHandleCallback(c, provider)
    const result = await svc.call(data)

    if (!result.success) {
      return c.json({ error: result.code, data: result.data }, 500)
    }

    return c.json(result.data)
  },
)

AuthRouter.post(
  "/refresh",
  zValidator("json", z.object({ refreshToken: z.string() })),
  async (c) => {
    const svc = new AuthRefreshAccessToken(c)
    const result = await svc.call(c.req.valid("json").refreshToken)

    if (!result.success) {
      return c.json({ error: result.code, data: result.data }, 500)
    }

    return c.json(result.data)
  },
)
