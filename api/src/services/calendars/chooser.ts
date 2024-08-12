import { Account, User } from "prisma/client"
import { Service } from "../base"

export class CalendarChooser extends Service {
  async call(account: Account, calendarId: string) {
    const user = this.ctx.user
    try {
      await this.updateAccount(user, account, calendarId)

      return this.success(null)
    } catch (error) {
      console.error(error)
      return this.failure()
    }
  }

  private async updateAccount(
    user: User,
    account: Account,
    calendarId: string,
  ) {
    await this.db.account.updateMany({
      where: { userId: user.id },
      data: { active: false },
    })

    await this.db.account.update({
      where: { id: account.id },
      data: { calendarId, active: true },
    })
  }
}
