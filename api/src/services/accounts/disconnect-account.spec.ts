import { prismaMock } from "prisma/__mocks__/client"
import { mockContext } from "spec/util"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { DisconnectAccount } from "./disconnect-account"

const svc = new DisconnectAccount(mockContext)
const account = mockContext.accounts[0]

vi.mock("prisma/client")

describe("when account is not found", () => {
  it("returns not_found error", async () => {
    const result = await svc.call("not-found")
    expect(result).toEqual({ success: false, code: "not_found", data: null })
  })
})

describe("when account is found", () => {
  it("deletes the account", async () => {
    await svc.call(account.id)

    expect(prismaMock.account.delete).toHaveBeenCalledWith({
      where: { id: account.id, userId: mockContext.user.id },
    })
  })

  it("returns success", async () => {
    const result = await svc.call(account.id)
    expect(result).toEqual({ success: true, data: null })
  })
})

describe("when database error occurs", () => {
  beforeEach(() => {
    prismaMock.account.delete.mockRejectedValue(new Error("Database error"))
  })

  it("returns server_error error", async () => {
    const result = await svc.call(account.id)
    expect(result).toEqual({ success: false, code: "server_error", data: null })
  })
})
