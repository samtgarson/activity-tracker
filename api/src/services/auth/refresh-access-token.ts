import { Service } from "../base"
import { generateAccessToken } from "./utils/tokens"

export class AuthRefreshAccessToken extends Service {
  async call(refreshToken: string) {
    const validated = await this.validateRefreshToken(refreshToken)
    if (!validated) return this.failure()

    const accessToken = await generateAccessToken(
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
