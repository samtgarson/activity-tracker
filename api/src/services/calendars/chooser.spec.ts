import { prismaMock } from "prisma/__mocks__/client"
import { mockContext } from "spec/util"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CalendarChooser } from "./chooser"

vi.mock("prisma/client")

describe("CalendarChooser", () => {
  let chooser: CalendarChooser
  const user = mockContext.user

  describe("when the user has no account", () => {
    beforeEach(() => {
      chooser = new CalendarChooser({
        ...mockContext,
        activeAccount: undefined,
      })
    })

    it("should fail", async () => {
      const result = await chooser.call("calendarId")
      expect(result).toEqual({ success: false, code: "missing_account" })
    })
  })

  describe("when the user has an account", () => {
    beforeEach(() => {
      chooser = new CalendarChooser(mockContext)
    })

    it("should clear previous active accounts", async () => {
      await chooser.call("calendarId")

      expect(prismaMock.account.updateMany).toHaveBeenCalledWith({
        where: { userId: user.id },
        data: { active: false },
      })
    })

    it("should update the account", async () => {
      await chooser.call("calendarId")

      expect(prismaMock.account.update).toHaveBeenCalledWith({
        where: { id: mockContext.activeAccount?.id },
        data: { calendarId: "calendarId", active: true },
      })
    })

    it("should succeed", async () => {
      const result = await chooser.call("calendarId")
      expect(result.success).toBe(true)
    })
  })
})
