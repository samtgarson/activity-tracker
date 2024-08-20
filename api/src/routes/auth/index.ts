import { zValidator } from "@hono/zod-validator"
import { oAuthCallbackParamsSchema } from "src/gateways/contracts/oauth"
import { providerSchema } from "src/models/schemas"
import { AuthGetRedirect } from "src/services/auth/get-redirect"
import { AuthHandleCallback } from "src/services/auth/handle-callback"
import { AuthRefreshAccessToken } from "src/services/auth/refresh-access-token"
import { z } from "zod"
import { newHono } from "../util"
import { loginRoute, refreshRoute } from "./doc"

export const AuthRouter = newHono()

AuthRouter.openapi(loginRoute, async function (c) {
  const provider = c.req.valid("param").provider
  const postRedirect = c.req.valid("query").external
    ? "activity-tracker://auth"
    : undefined
  const svc = new AuthGetRedirect(c, provider)
  const result = await svc.call(postRedirect)

  if (result.success) {
    return c.redirect(result.data)
  } else {
    return c.json({ error: result.code, data: result.data }, 500)
  }
})

AuthRouter.get(
  "/auth/callback/:provider",
  zValidator("param", z.object({ provider: providerSchema })),
  zValidator("query", oAuthCallbackParamsSchema),
  async (c) => {
    const provider = c.req.valid("param").provider
    const data = c.req.valid("query")
    const svc = new AuthHandleCallback(c, provider)
    const result = await svc.call(data)

    if (!result.success) {
      return c.json({ error: result.code, data: result.data }, 500)
    }

    if (result.data.redirect) {
      const redirect = new URL(result.data.redirect)
      redirect.search = new URLSearchParams({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken.token,
        refreshTokenExpiresAt: result.data.refreshToken.expiresAt.toISOString(),
      }).toString()

      return c.redirect(redirect.toString())
    }

    return c.json(result.data)
  },
)

AuthRouter.openapi(refreshRoute, async function (c) {
  const svc = new AuthRefreshAccessToken(c)
  const result = await svc.call(c.req.valid("json").refreshToken)

  if (!result.success) {
    return c.json({ error: result.code, data: result.data }, 500)
  }

  return c.json(result.data, 201)
})
