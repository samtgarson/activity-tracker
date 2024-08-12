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

  it("should clear previous active accounts", async () => {
    await chooser.call(account, "calendarId")

    expect(prismaMock.account.updateMany).toHaveBeenCalledWith({
      where: { userId: user.id },
      data: { active: false },
    })
  })

  it("should update the account", async () => {
    await chooser.call(account, "calendarId")

    expect(prismaMock.account.update).toHaveBeenCalledWith({
      where: { id: account.id },
      data: { calendarId: "calendarId", active: true },
    })
  })

  it("should succeed", async () => {
    const result = await chooser.call(account, "calendarId")
    expect(result.success).toBe(true)
  })
})
