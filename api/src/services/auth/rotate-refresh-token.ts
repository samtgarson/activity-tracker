import { Service, ServiceInput } from "../base"
import { generateRefreshToken } from "./utils/tokens"

export interface AuthRotateRefreshTokenDeps {
  generate: typeof generateRefreshToken
}

export class AuthRotateRefreshToken extends Service {
  constructor(
    ctx: ServiceInput,
    private deps: AuthRotateRefreshTokenDeps = {
      generate: generateRefreshToken,
    },
  ) {
    super(ctx)
  }

  async call(token: string) {
    const revoked = await this.invalidateOldToken(token)
    if (!revoked) return this.failure()

    const newToken = this.deps.generate()
    await this.db.refreshToken.create({
      data: {
        ...newToken,
        user: { connect: { id: this.ctx.user.id } },
      },
    })

    return this.success(newToken)
  }

  private async invalidateOldToken(token: string) {
    try {
      return await this.db.refreshToken.delete({
        where: { token, userId: this.ctx.user.id },
      })
    } catch (e) {
      console.error(e)
      return false
    }
  }
}
