import { Service } from "../base"

export type DisconnectAccountErrorMap = {
  not_found: null
  server_error: null
}

export class DisconnectAccount extends Service<DisconnectAccountErrorMap> {
  async call(id: string) {
    const account = this.ctx.findAccount(id)
    if (!account) {
      return this.failure("not_found", null)
    }

    try {
      await this.db.account.delete({
        where: { id, userId: this.ctx.user.id },
      })

      return this.success(null)
    } catch (e) {
      console.error(e)
      return this.failure("server_error", null)
    }
  }
}
