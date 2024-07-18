import { User } from '@/app/models/user'
import { prismaClient } from '@/app/utils/prisma'
import { Service } from '@/app/utils/service'

export type UserFinderErrors = {
  not_found: undefined
}

export class UserFinder extends Service<User, UserFinderErrors> {
  constructor(private prisma = prismaClient) {
    super()
  }

  public async call(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { account: true }
    })

    if (user === null) return this.failure('not_found')
    return this.success(new User(user))
  }
}
