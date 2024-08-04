import { zValidator } from "@hono/zod-validator"
import { oAuthCallbackParamsSchema } from "src/gateways/contracts/oauth"
import { Provider } from "src/models/types"
import { AuthGetRedirect } from "src/services/auth/get-redirect"
import { AuthHandleCallback } from "src/services/auth/handle-callback"
import {
  generateAccessToken,
  generateRefreshToken,
} from "src/services/auth/tokens"
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

    const { user } = result.data
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(user, c.env.JWT_SECRET),
      generateRefreshToken(),
    ])

    return c.json({ accessToken, refreshToken })
  },
)
