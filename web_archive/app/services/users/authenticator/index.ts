import { UserWithAccount } from '@/app/types'
import { prismaClient } from '@/app/utils/prisma'
import { Prisma, PrismaClient, User } from '@prisma/client'

export type UserAttrs = Prisma.UserCreateInput
export type AccountAttrs = Omit<Prisma.AccountCreateInput, 'user'>

export class UserAuthenticator {
  constructor(private prisma: PrismaClient = prismaClient) {}

  async call(
    userAttrs: UserAttrs,
    accountAttrs: AccountAttrs
  ): Promise<UserWithAccount> {
    const user = await this.findUser(userAttrs.email)
    if (user) {
      await this.upsertAccount(user, accountAttrs)
      return user
    }

    return this.createUser(userAttrs, accountAttrs)
  }

  private async findUser(email: string) {
    return this.prisma.user.findFirst({
      where: { email },
      include: { account: true }
    })
  }

  private async findAccount(attrs: AccountAttrs) {
    return this.prisma.account.findFirst({
      where: {
        remoteId: attrs.remoteId,
        provider: attrs.provider
      },
      include: { user: true }
    })
  }

  private async upsertAccount(user: User, data: AccountAttrs) {
    const account = await this.findAccount(data)
    if (account) {
      return this.prisma.account.update({
        where: { id: account.id },
        data
      })
    }
    return this.prisma.account.create({
      data: {
        ...data,
        user: { connect: { id: user.id } }
      }
    })
  }

  private async createUser(userAttrs: UserAttrs, accountAttrs: AccountAttrs) {
    return this.prisma.user.create({
      data: {
        ...userAttrs,
        account: { create: { ...accountAttrs, active: true } }
      },
      include: { account: true }
    })
  }
}
