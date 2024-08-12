import { prismaMock } from "prisma/__mocks__/client"
import { buildUser } from "spec/factories/user-factory"
import { mockContext } from "spec/util"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthDecodeToken, AuthDecodeTokenDeps } from "./decode-token"

vi.mock("prisma/client")

const deps: AuthDecodeTokenDeps = {
  decode: vi.fn().mockResolvedValue({ sub: "1" }),
}
const svc = new AuthDecodeToken(mockContext, deps)

describe("when header is undefined", () => {
  it("returns a failure", async () => {
    const result = await svc.call()
    expect(result).toEqual({
      success: false,
      code: "server_error",
      data: undefined,
    })
  })
})

describe("when header is invalid", () => {
  it("returns a failure", async () => {
    const result = await svc.call("invalid")
    expect(result).toEqual({
      success: false,
      code: "server_error",
      data: undefined,
    })
  })
})

describe("when token is valid", () => {
  const header = "Bearer valid"

  it("decodes the token", async () => {
    await svc.call(header)

    expect(deps.decode).toHaveBeenCalledWith(
      "valid",
      mockContext.env.JWT_SECRET,
    )
  })

  it("finds the user", async () => {
    await svc.call(header)

    expect(prismaMock.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: "1" },
      include: { accounts: true },
    })
  })

  it("returns the user", async () => {
    const user = buildUser()
    prismaMock.user.findUniqueOrThrow.mockResolvedValue(user)

    const result = await svc.call(header)
    expect(result).toEqual({
      success: true,
      data: user,
    })
  })
})

describe("when token cannot be decoded", () => {
  beforeEach(() => {
    vi.mocked(deps.decode).mockRejectedValue(new Error())
  })

  it("returns a failure", async () => {
    const result = await svc.call("Bearer valid")
    expect(result).toEqual({
      success: false,
      code: "server_error",
      data: undefined,
    })
  })
})

describe("when user cannot be found", () => {
  beforeEach(() => {
    prismaMock.user.findUniqueOrThrow.mockRejectedValue(new Error())
  })

  it("returns a failure", async () => {
    const result = await svc.call("Bearer valid")
    expect(result).toEqual({
      success: false,
      code: "server_error",
      data: undefined,
    })
  })
})
