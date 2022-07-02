import { userFactory } from '@/test/factories/user'
import { PrismaClient } from '@prisma/client'
import { UserAuthenticator } from '.'

const prisma = {
  user: {
    findFirst: vi.fn(),
    create: vi.fn()
  },
  account: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  }
}

describe('UserAuthenticator', () => {
  let authenticator: UserAuthenticator

  beforeEach(() => {
    authenticator = new UserAuthenticator(prisma as unknown as PrismaClient)
  })

  const {
    account: [account],
    ...user
  } = userFactory.build()

  describe('when the user already exists', () => {
    beforeEach(() => {
      prisma.user.findFirst.mockResolvedValue(user)
    })

    it('should try and find the user', async () => {
      await authenticator.call(user, account)
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: user.email },
        include: { account: true }
      })
    })

    describe('when the account already exists', () => {
      beforeEach(() => {
        prisma.account.findFirst.mockResolvedValue(account)
      })

      it('should update the account', async () => {
        await authenticator.call(user, account)
        expect(prisma.account.update).toHaveBeenCalledWith({
          where: { id: account.id },
          data: account
        })
      })
    })

    describe('when the account does not exist', () => {
      beforeEach(() => {
        prisma.account.findFirst.mockResolvedValue(null)
      })

      it('should create the account', async () => {
        await authenticator.call(user, account)
        expect(prisma.account.create).toHaveBeenCalledWith({
          data: {
            ...account,
            user: { connect: { id: user.id } }
          }
        })
      })
    })

    it('should return the user', async () => {
      const result = await authenticator.call(user, account)

      expect(result).toEqual(user)
    })
  })

  describe('when the user does not exist', () => {
    beforeEach(() => {
      prisma.user.findFirst.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue(user)
    })

    it('should create the user', async () => {
      await authenticator.call(user, account)
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { ...user, account: { create: account } },
        include: { account: true }
      })
    })

    it('should return the user', async () => {
      const result = await authenticator.call(user, account)

      expect(result).toEqual(user)
    })
  })
})
