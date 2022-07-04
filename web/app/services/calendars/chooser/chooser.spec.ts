import { User } from '@/app/models/user'
import { accountFactory, userFactory } from '@/test/factories/user'
import { PrismaClient } from '@prisma/client'
import { CalendarChooser } from '.'

const prisma = {
  account: { update: vi.fn() }
}

describe('CalendarChooser', () => {
  let chooser: CalendarChooser

  beforeEach(() => {
    chooser = new CalendarChooser(prisma as unknown as PrismaClient)
  })

  describe('when the user has no account', () => {
    const user = new User(userFactory.build())
    user.account = []

    it('should fail', async () => {
      const result = await chooser.call(user, 'google', 'calendarId')
      expect(result.success).toBe(false)
      expect(!result.success && result.error).toBe('No account for google')
    })
  })

  describe('when the user has an account', () => {
    const user = new User(userFactory.build())

    describe('and the account is not active', () => {
      user.account = accountFactory.buildList(1, { active: false })

      it('should clear previous active accounts', async () => {
        await chooser.call(user, 'google', 'calendarId')

        expect(prisma.account.update).toHaveBeenNthCalledWith(1, {
          where: { userId: user.id },
          data: { active: false }
        })
      })
    })

    it('should update the account', async () => {
      const account = user.account[0]
      await chooser.call(user, 'google', 'calendarId')

      expect(prisma.account.update).toHaveBeenCalledWith({
        where: { id: account.id },
        data: { calendarId: 'calendarId', active: true }
      })
    })

    it('should succeed', async () => {
      const result = await chooser.call(user, 'google', 'calendarId')
      expect(result.success).toBe(true)
    })
  })
})
