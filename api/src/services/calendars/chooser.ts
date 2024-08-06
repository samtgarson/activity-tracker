import { Account, User } from "prisma/client"
import { Service } from "../base"

export type CalendarChooserErrors = {
  missing_account: undefined
}

export class CalendarChooser extends Service<CalendarChooserErrors> {
  async call(calendarId: string) {
    const user = this.ctx.user
    const account = this.ctx.activeAccount

    if (!account) return this.failure("missing_account")
    await this.updateAccount(user, account, calendarId)

    return this.success(null)
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
