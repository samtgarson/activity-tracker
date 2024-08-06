import { prismaMock } from "prisma/__mocks__/client"
import { buildAccount } from "spec/factories/account-factory"
import { buildRefreshToken } from "spec/factories/refresh-token-factory"
import { buildUser } from "spec/factories/user-factory"
import { mockContext } from "spec/util"
import { Provider } from "src/models/types"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  AuthHandleCallback,
  HandleCallbackDependencies,
} from "./handle-callback"

const deps: HandleCallbackDependencies = {
  oauth: { exchangeCode: vi.fn() },
  fetchProfile: { call: vi.fn() },
  verifyJwt: vi.fn(async () => ({ origin: "activity-tracker" })),
  generateAccessToken: vi.fn(async () => "access-token"),
  generateRefreshToken: vi.fn(() => ({
    token: "refresh-token",
    expiresAt: new Date(),
  })),
}
const args = { state: "state", code: "code" }
const user = buildUser()

vi.mock("prisma/client")

beforeEach(() => {
  prismaMock.user.create.mockResolvedValue(user)
  prismaMock.user.update.mockResolvedValue(user)
  prismaMock.refreshToken.create.mockResolvedValue(buildRefreshToken())
  vi.spyOn(crypto, "randomUUID").mockReturnValue("random")
  vi.spyOn(Date, "now").mockReturnValue(0)
})

describe("with Google provier", () => {
  const service = new AuthHandleCallback(mockContext, Provider.Google, deps)
  const authData = {
    accessToken: "access",
    scope: "scope",
    expiresAt: new Date(),
    tokenType: "Bearer",
    refreshToken: "refresh",
  }

  describe("when code is exchanged successfully", () => {
    beforeEach(() => {
      vi.mocked(deps.oauth.exchangeCode).mockResolvedValue({
        success: true,
        data: authData,
      })
    })

    describe("when profile is fetched successfully", () => {
      const profileData = {
        id: "id",
        displayName: "displayName",
        familyName: "familyName",
        givenName: "givenName",
        email: "email",
        picture: "picture",
      }

      beforeEach(() => {
        vi.mocked(deps.fetchProfile.call).mockResolvedValue({
          success: true,
          data: profileData,
        })
      })

      it("returns the user", async () => {
        const res = await service.call(args)
        expect(res.success).toBeTruthy()
        expect(res.data).toEqual({
          redirect: undefined,
          accessToken: "access-token",
          refreshToken: { token: "refresh-token", expiresAt: expect.any(Date) },
        })
      })

      it("generates tokens", async () => {
        await service.call(args)
        expect(deps.generateAccessToken).toHaveBeenCalledWith(
          user,
          mockContext.env.JWT_SECRET,
        )
        expect(deps.generateRefreshToken).toHaveBeenCalledWith()
      })

      it("creates a refresh token", async () => {
        await service.call(args)
        expect(prismaMock.refreshToken.create).toHaveBeenCalledWith({
          data: {
            token: "refresh-token",
            expiresAt: expect.any(Date),
            user: { connect: { id: user.id } },
          },
        })
      })

      it("creates a new user", async () => {
        await service.call(args)

        expect(prismaMock.user.create).toHaveBeenCalledWith({
          data: {
            ...profileData,
            id: "random",
            accounts: {
              create: {
                id: "random",
                provider: Provider.Google,
                remoteId: profileData.id,
                active: true,
                ...authData,
              },
            },
          },
          include: { accounts: true },
        })
        expect(prismaMock.user.update).not.toHaveBeenCalled()
      })

      it("verifies the state", async () => {
        await service.call(args)
        expect(deps.verifyJwt).toHaveBeenCalledWith(
          args.state,
          mockContext.env.JWT_SECRET,
        )
      })

      it("exchanges the code", async () => {
        await service.call(args)
        expect(deps.oauth.exchangeCode).toHaveBeenCalledWith(args.code)
      })

      it("fetches the profile", async () => {
        await service.call(args)
        expect(deps.fetchProfile.call).toHaveBeenCalledWith(
          Provider.Google,
          authData.accessToken,
        )
      })

      describe("when a user already exists", () => {
        const user = buildUser()

        beforeEach(() => {
          prismaMock.user.findUnique.mockResolvedValue(user)
        })

        describe("with an account that doesnt match", () => {
          it("fails with new_account", async () => {
            const res = await service.call(args)
            expect(res).toEqual({
              success: false,
              code: "new_account",
              data: null,
            })
          })
        })

        describe("with an account that matches", () => {
          const account = buildAccount({ provider: Provider.Google })

          beforeEach(() => {
            vi.mocked(user.accountFor).mockResolvedValue(account)
          })

          it("queries the correct account", async () => {
            await service.call(args)
            expect(user.accountFor).toHaveBeenCalledWith(Provider.Google)
          })

          it("updates the user", async () => {
            await service.call(args)
            const { id, ...profileDataWithoutId } = profileData

            expect(prismaMock.user.update).toHaveBeenCalledWith({
              where: { id: user.id },
              data: {
                ...profileDataWithoutId,
                accounts: {
                  update: {
                    where: { id: account.id },
                    data: {
                      provider: Provider.Google,
                      remoteId: profileData.id,
                      ...authData,
                    },
                  },
                },
              },
              include: { accounts: true },
            })
            expect(prismaMock.user.create).not.toHaveBeenCalled()
          })
        })
      })

      describe("when profile fetch errors", () => {
        beforeEach(() => {
          vi.mocked(deps.fetchProfile.call).mockResolvedValue({
            success: false,
            code: "server_error",
            data: null as never,
          })
        })

        it("returns a failure response", async () => {
          const res = await service.call(args)
          expect(res).toEqual({
            success: false,
            code: "fetch_profile_failed",
            data: null,
          })
        })
      })
    })

    describe("when code exchange errors", () => {
      beforeEach(() => {
        vi.mocked(deps.oauth.exchangeCode).mockResolvedValue({
          success: false,
          code: "server_error",
          data: undefined,
        })
      })

      it("returns a failure response", async () => {
        const res = await service.call(args)
        expect(res).toEqual({
          success: false,
          code: "code_exchange_failed",
          data: null,
        })
      })
    })
  })
})
