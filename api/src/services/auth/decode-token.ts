import { Service, ServiceInput } from "../base"
import { decodeAccessToken } from "./utils/tokens"

export interface AuthDecodeTokenDeps {
  decode: typeof decodeAccessToken
}

export class AuthDecodeToken extends Service {
  constructor(
    ctx: ServiceInput,
    private deps: AuthDecodeTokenDeps = { decode: decodeAccessToken },
  ) {
    super(ctx)
  }

  async call(header?: string) {
    const token = this.parseToken(header)
    if (!token) return this.failure()
    try {
      const { sub } = await this.deps.decode(token, this.ctx.env.JWT_SECRET)
      const user = await this.db.user.findUniqueOrThrow({ where: { id: sub } })

      return this.success(user)
    } catch (e) {
      console.error(e)
      return this.failure()
    }
  }

  private parseToken(header?: string) {
    const matches = header?.match(/Bearer (.+)/)
    return matches ? matches[1] : null
  }
}
