import { prismaMock } from "prisma/__mocks__/client"
import { buildUser } from "spec/factories/user-factory"
import { mockContext } from "spec/util"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  AuthRefreshAccessToken,
  AuthRefreshAccessTokenDeps,
} from "./refresh-access-token"

vi.mock("prisma/client")

const deps = {
  generate: vi.fn(),
} satisfies AuthRefreshAccessTokenDeps
const svc = new AuthRefreshAccessToken(mockContext, deps)

describe("when refresh token cannot be found", () => {
  beforeEach(() => {
    prismaMock.refreshToken.findUnique.mockResolvedValue(null)
  })

  it("returns a failure", async () => {
    const result = await svc.call("token")
    expect(result).toEqual({
      success: false,
      code: "server_error",
      data: undefined,
    })
  })
})

describe("when refresh token is found", () => {
  const user = buildUser()
  const accessToken = "access-token"

  beforeEach(() => {
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      // @ts-expect-error TODO how to type this with the include
      user,
    })
    deps.generate.mockResolvedValue(accessToken)
  })

  it("returns a success", async () => {
    const result = await svc.call("token")
    expect(result).toEqual({
      success: true,
      data: { accessToken },
    })
  })

  it("generates an access token", async () => {
    await svc.call("token")
    expect(deps.generate).toHaveBeenCalledWith(user, mockContext.env.JWT_SECRET)
  })
})
