import { Account, prisma, User } from "prisma/client"
import { buildAccount } from "spec/factories/account-factory"
import { buildUser } from "spec/factories/user-factory"
import { mockContext } from "spec/util"
import { beforeEach, describe, expect, it } from "vitest"
import { Provider } from "./types"

const client = prisma(mockContext.env.DB)

let user: User
beforeEach(async function () {
  const { accountFor, activeAccount, ...userAttrs } = buildUser()
  user = await client.user.create({ data: userAttrs })
})

describe("activeAccount", () => {
  describe("when the user has no accounts", () => {
    it("should return null", async () => {
      await expect(user.activeAccount).resolves.toBeNull()
    })
  })

  describe("when the user has an active account", () => {
    let accountAttrs: Account

    beforeEach(async function () {
      accountAttrs = buildAccount({ userId: user.id, active: true })
      await client.account.create({ data: accountAttrs })
    })

    it("should return the active account", async () => {
      await expect(user.activeAccount).resolves.toEqual(accountAttrs)
    })
  })

  describe("when the user as an inactive account", () => {
    let accountAttrs: Account

    beforeEach(async function () {
      accountAttrs = buildAccount({ userId: user.id, active: false })
      await client.account.create({ data: accountAttrs })
    })

    it("should return null", async () => {
      await expect(user.activeAccount).resolves.toBeNull()
    })
  })
})

describe("accountFor", () => {
  describe("when the user has no account for the provider", () => {
    it("should return null", async () => {
      await expect(user.accountFor(Provider.Google)).resolves.toBeNull()
    })
  })

  describe("when the user has an account for the provider", () => {
    let accountAttrs: Account

    beforeEach(async function () {
      accountAttrs = buildAccount({
        userId: user.id,
        provider: Provider.Google,
      })
      await client.account.create({ data: accountAttrs })
    })

    it("should return the account", async () => {
      await expect(user.accountFor(Provider.Google)).resolves.toEqual(
        accountAttrs,
      )
    })

    it("should not return the account for a different provider", async () => {
      await expect(user.accountFor("fake" as Provider)).resolves.toBeNull()
    })
  })
})
