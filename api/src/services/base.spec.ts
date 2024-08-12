import { mockContext } from "spec/util"
import { describe, expect, it } from "vitest"
import { Service } from "./base"

class TestService extends Service {
  async call() {
    return this.success("test")
  }

  get context() {
    return this.ctx
  }
}

const testService = new TestService({
  env: mockContext.env,
  var: {
    jwtPayload: null,
    ctx: mockContext,
  },
  req: { url: "https://google.com" },
})

describe("Service", () => {
  it("assigns the context", () => {
    expect(testService.context).toMatchObject({
      env: mockContext.env,
      url: new URL("https://google.com"),
      user: mockContext.user,
      accounts: mockContext.accounts,
    })
  })
})
