import { Service } from "../base"
import { decodeAccessToken } from "./utils/tokens"

export class AuthDecodeToken extends Service {
  async call(header?: string) {
    const token = header?.replace("Bearer ", "")
    if (!token) return this.failure()
    try {
      const { sub } = await decodeAccessToken(token, this.ctx.env.JWT_SECRET)
      const user = await this.db.user.findUniqueOrThrow({ where: { id: sub } })

      return this.success(user)
    } catch (e) {
      console.error(e)
      return this.failure()
    }
  }
}
