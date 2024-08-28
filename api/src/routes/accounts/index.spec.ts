import { mockContext, withAuth } from "spec/util"
import { DisconnectAccount } from "src/services/accounts/disconnect-account"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AccountsRouter } from "../accounts"

vi.mock("src/services/accounts/disconnect-account", async () => ({
  DisconnectAccount: vi.fn().mockReturnValue({
    call: vi.fn().mockReturnValue({
      success: true,
      data: null,
    }),
  }),
}))

const account = mockContext.accounts[0]

describe("DELETE /accounts/:id", () => {
  const router = withAuth(AccountsRouter)

  describe("when service is successful", () => {
    beforeEach(() => {
      vi.mocked(new DisconnectAccount(mockContext)).call.mockResolvedValue({
        success: true,
        data: null,
      })
    })

    it("calls the service", async () => {
      await router.request(`/accounts/${account.id}`, { method: "DELETE" })
      expect(new DisconnectAccount(mockContext).call).toHaveBeenCalledWith(
        account.id,
      )
    })

    it("returns 204", async () => {
      const res = await router.request(`/accounts/${account.id}`, {
        method: "DELETE",
      })

      expect(res.status).toBe(204)
      expect(res.body).toBe(null)
    })
  })

  describe("when service fails", () => {
    describe("with notFound", () => {
      beforeEach(() => {
        vi.mocked(new DisconnectAccount(mockContext)).call.mockResolvedValue({
          success: false,
          code: "not_found",
          data: null as never,
        })
      })

      it("returns an error", async () => {
        const res = await router.request(`/accounts/${account.id}`, {
          method: "DELETE",
        })

        expect(res.status).toBe(404)
        expect(await res.json()).toEqual({ error: "not_found" })
      })
    })

    describe("with serverError", () => {
      beforeEach(() => {
        vi.mocked(new DisconnectAccount(mockContext)).call.mockResolvedValue({
          success: false,
          code: "server_error",
          data: null as never,
        })
      })

      it("returns an error", async () => {
        const res = await router.request(`/accounts/${account.id}`, {
          method: "DELETE",
        })

        expect(res.status).toBe(500)
        expect(await res.json()).toEqual({ error: "server_error" })
      })
    })
  })
})
