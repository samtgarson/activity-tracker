import { User } from '@/app/models/user'
import { Account, Provider } from '@/app/types'
import { prismaClient } from '@/app/utils/prisma'
import { Service } from '@/app/utils/service'

export type CalendarChooserErrors = {
  missing_account: undefined
}

export class CalendarChooser extends Service<null, CalendarChooserErrors> {
  constructor(private prisma = prismaClient) {
    super()
  }

  async call(user: User, provider: Provider, calendarId: string) {
    const account = user.accountFor(provider)

    if (!account) return this.failure('missing_account')
    this.updateAccount(user, account, calendarId)

    return this.success(null)
  }

  private async updateAccount(
    user: User,
    account: Account,
    calendarId: string
  ) {
    if (!account.active) {
      await this.prisma.account.update({
        where: { userId: user.id },
        data: { active: false }
      })
    }

    await this.prisma.account.update({
      where: { id: account.id },
      data: { calendarId, active: true }
    })
  }
}
