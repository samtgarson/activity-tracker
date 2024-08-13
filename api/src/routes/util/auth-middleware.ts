import { Context } from "hono"
import { AuthDecodeToken } from "src/services/auth/decode-token"
import { RefreshProviderToken } from "src/services/auth/refresh-provider-token"
import { ServiceContext } from "src/services/base"
import { organize } from "src/services/util/organize"
import { Ctx } from "."

export async function authenticate(
  c: Context<Ctx, "/*">,
  next: () => Promise<void>,
) {
  const authSvc = new AuthDecodeToken(c)
  const authResult = await authSvc.call(c.req.header("Authorization"))
  if (!authResult.success) return c.json({ error: "Not authorized" }, 401)
  const { accounts, ...user } = authResult.data
  c.set("ctx", new ServiceContext(c.env, new URL(c.req.url), user, accounts))

  if (!accounts.length) return await next()

  const refreshSvc = new RefreshProviderToken(c)
  const refreshResult = await organize(accounts, (acc) => refreshSvc.call(acc))

  if (!refreshResult.success)
    return c.json({ error: "Failed to refresh token for active account" }, 500)

  c.var.ctx.accounts = refreshResult.data
  await next()
}
