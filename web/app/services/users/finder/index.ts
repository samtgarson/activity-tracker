import { User } from '@/app/models/user'
import { prismaClient } from '@/app/utils/prisma'
import { ServiceResult, Svc } from '@/app/utils/service'

export class UserFinder {
  constructor(private prisma = prismaClient) {}

  public async call(id: string): Promise<ServiceResult<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { account: true }
    })

    if (user === null) return Svc.error('Could not find user')
    return Svc.success(new User(user))
  }
}
