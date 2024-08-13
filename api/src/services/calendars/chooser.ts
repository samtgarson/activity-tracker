import { Account, User } from "prisma/client"
import { Service } from "../base"

type CalendarChooserErrorMap = {
  calendar_not_found: undefined
  server_error: undefined
}

export class CalendarChooser extends Service<CalendarChooserErrorMap> {
  async call(account: Account, calendarId: string) {
    const user = this.ctx.user
    try {
      const updated = await this.updateAccount(user, account, calendarId)
      if (!updated) return this.failure("calendar_not_found")

      return this.success(null)
    } catch (error) {
      console.error(error)
      return this.failure("server_error")
    }
  }

  private async updateAccount(
    user: User,
    account: Account,
    calendarId: string,
  ) {
    const updated = await this.db.account.updateMany({
      where: { id: account.id },
      data: { calendarId, active: true },
    })
    if (!updated.count) return false

    await this.db.account.updateMany({
      where: { userId: user.id },
      data: { active: false },
    })

    return true
  }
}
