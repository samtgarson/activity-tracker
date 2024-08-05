import { Service } from "../base"
import { generateRefreshToken } from "./utils/tokens"

export class AuthRotateRefreshToken extends Service {
  async call(token: string) {
    const revoked = await this.invalidateOldToken(token)
    if (!revoked) return this.failure()

    const newToken = generateRefreshToken()
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
