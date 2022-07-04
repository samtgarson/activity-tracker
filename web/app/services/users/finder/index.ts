import { User } from '@/app/models/user'
import { ServiceResult } from '@/app/types'
import { prismaClient } from '@/app/utils/prisma'

export class UserFinder {
  constructor(private prisma = prismaClient) {}

  public async call(id: string): Promise<ServiceResult<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { account: true }
    })

    if (user === null) return { error: 'Could not find user' }
    return { data: new User(user) }
  }
}
