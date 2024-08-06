import { faker } from "@faker-js/faker"
import { prismaMock } from "prisma/__mocks__/client"
import { buildAccount } from "spec/factories/account-factory"
import { mockContext } from "spec/util"
import type { OAuthGateway } from "src/gateways/oauth-gateway"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import {
  RefreshProviderToken,
  RefreshProviderTokenDeps,
} from "./refresh-provider-token"

vi.mock("prisma/client")

const mockGateway = mockDeep<OAuthGateway>()
const deps = {
  oauth: vi.fn(() => mockGateway),
} satisfies RefreshProviderTokenDeps

const svc = new RefreshProviderToken(mockContext, deps)

describe("when the account has no expiry date", () => {
  const account = buildAccount({ expiresAt: null })

  it("returns a success", async () => {
    const result = await svc.call(account)
    expect(result).toEqual({
      success: true,
      data: account,
    })
  })
})

describe("when the account has not expired", () => {
  const account = buildAccount()

  it("returns a success", async () => {
    const result = await svc.call(account)
    expect(result).toEqual({
      success: true,
      data: account,
    })
  })
})

describe("when the account has expired", () => {
  const account = buildAccount({ expiresAt: faker.date.recent() })

  describe("and the token cannot be refreshed", () => {
    beforeEach(() => {
      mockGateway.refreshToken.mockResolvedValue({
        success: false,
        data: undefined,
        code: "server_error",
      })
    })

    it('refreshes the token with the "oauth" gateway', async () => {
      await svc.call(account)
      expect(mockGateway.refreshToken).toHaveBeenCalledWith(
        account.refreshToken,
      )
    })

    it("returns a failure", async () => {
      const result = await svc.call(account)
      expect(result).toEqual({
        success: false,
        code: "server_error",
        data: undefined,
      })
    })
  })

  describe("and the token can be refreshed", () => {
    const authData = {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      expiresAt: faker.date.future(),
      tokenType: "Bearer",
      scope: "read write",
    }
    const updatedAccount = buildAccount()

    beforeEach(() => {
      mockGateway.refreshToken.mockResolvedValue({
        success: true,
        data: authData,
      })
      prismaMock.account.update.mockResolvedValue(updatedAccount)
    })

    it("returns a success", async () => {
      const result = await svc.call(account)
      expect(result).toEqual({
        success: true,
        data: updatedAccount,
      })
    })

    it("updates the account with the new auth data", async () => {
      await svc.call(account)
      expect(prismaMock.account.update).toHaveBeenCalledWith({
        where: { id: account.id },
        data: authData,
      })
    })
  })
})
