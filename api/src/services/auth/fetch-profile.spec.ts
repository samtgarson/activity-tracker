import { mockContext } from "spec/util"
import { ProfileAttributes, Provider } from "src/models/types"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { FetchProfile, FetchProfileDependencies } from "./fetch-profile"

const data = { id: "1" } as ProfileAttributes
const deps = {
  google: {
    getProfile: vi.fn().mockResolvedValue({ success: true, data }),
  },
} satisfies FetchProfileDependencies

const service = new FetchProfile(mockContext, deps)

it("should fetch profile", async () => {
  await service.call(Provider.Google, "access-token")

  expect(deps.google.getProfile).toHaveBeenCalledWith("access-token")
})

it("should return success", async () => {
  const res = await service.call(Provider.Google, "access-token")

  expect(res).toEqual({ success: true, data })
})

describe("when fetching the profile fails", () => {
  beforeEach(() => {
    deps.google.getProfile.mockImplementationOnce(async () => ({
      success: false,
      code: "server_error",
      data: null,
    }))
  })

  it("should return failure", async () => {
    const res = await service.call(Provider.Google, "access-token")

    expect(res).toEqual({ success: false, code: "server_error" })
  })
})
