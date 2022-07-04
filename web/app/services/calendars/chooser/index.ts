import { User } from '@/app/models/user'
import { Account, Provider } from '@/app/types'
import { prismaClient } from '@/app/utils/prisma'
import { ServiceResult, Svc } from '@/app/utils/service'

export class CalendarChooser {
  constructor(private prisma = prismaClient) {}

  async call(
    user: User,
    provider: Provider,
    calendarId: string
  ): Promise<ServiceResult> {
    const account = user.accountFor(provider)

    if (!account) return Svc.error(`No account for ${provider}`)
    this.updateAccount(user, account, calendarId)

    return Svc.success(null)
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
