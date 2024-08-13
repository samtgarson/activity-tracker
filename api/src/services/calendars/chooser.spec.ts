import { prismaMock } from "prisma/__mocks__/client"
import { buildAccount } from "spec/factories/account-factory"
import { mockContext } from "spec/util"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CalendarChooser } from "./chooser"

vi.mock("prisma/client")

describe("CalendarChooser", () => {
  let chooser: CalendarChooser
  const user = mockContext.user

  const account = buildAccount()
  beforeEach(() => {
    chooser = new CalendarChooser(mockContext)
  })

  describe("when account can be found", () => {
    beforeEach(() => {
      prismaMock.account.updateMany.mockResolvedValueOnce({ count: 1 })
    })

    it("should update the account", async () => {
      await chooser.call(account, "calendarId")

      expect(prismaMock.account.updateMany).toHaveBeenNthCalledWith(1, {
        where: { id: account.id },
        data: { calendarId: "calendarId", active: true },
      })
    })

    it("should clear previous active accounts", async () => {
      await chooser.call(account, "calendarId")

      expect(prismaMock.account.updateMany).toHaveBeenNthCalledWith(2, {
        where: { userId: user.id },
        data: { active: false },
      })
    })

    it("should succeed", async () => {
      const result = await chooser.call(account, "calendarId")
      expect(result.success).toBe(true)
    })
  })

  describe("when account cannot be found", () => {
    beforeEach(() => {
      prismaMock.account.updateMany.mockResolvedValueOnce({ count: 0 })
    })
    it("should update the account, but not clear previous accounts", async () => {
      await chooser.call(account, "calendarId")

      expect(prismaMock.account.updateMany).toHaveBeenCalledTimes(1)
      expect(prismaMock.account.updateMany).toHaveBeenNthCalledWith(1, {
        where: { id: account.id },
        data: { calendarId: "calendarId", active: true },
      })
    })

    it("should fail", async () => {
      const result = await chooser.call(account, "calendarId")
      expect(result).toEqual({ success: false, code: "calendar_not_found" })
    })
  })
})
