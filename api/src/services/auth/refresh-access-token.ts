import { Service, ServiceInput } from "../base"
import { generateAccessToken } from "./utils/tokens"

export interface AuthRefreshAccessTokenDeps {
  generate: typeof generateAccessToken
}

export class AuthRefreshAccessToken extends Service {
  constructor(
    ctx: ServiceInput,
    private deps: AuthRefreshAccessTokenDeps = {
      generate: generateAccessToken,
    },
  ) {
    super(ctx)
  }

  async call(refreshToken: string) {
    const validated = await this.validateRefreshToken(refreshToken)
    if (!validated) return this.failure()

    const accessToken = await this.deps.generate(
      validated.user,
      this.ctx.env.JWT_SECRET,
    )
    return this.success({ accessToken })
  }

  private async validateRefreshToken(token: string) {
    return this.db.refreshToken.findUnique({
      where: { token, revokedAt: null },
      include: { user: true },
    })
  }
}
