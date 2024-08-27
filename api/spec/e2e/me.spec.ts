import { D1Database } from "@cloudflare/workers-types"
import { Account, User, prisma } from "prisma/client"
import { buildAccount } from "spec/factories/account-factory"
import { buildUser } from "spec/factories/user-factory"
import { json } from "spec/util/matchers"
import app from "src"
import { serializeAccount } from "src/serializers/account-serializer"
import { generateAccessToken } from "src/services/auth/utils/tokens"
import { beforeEach, describe, expect, it } from "vitest"

const client = prisma({} as D1Database)
const secret = "secret"
let token: string
let user: User
let account: Account

beforeEach(async () => {
  user = buildUser()
  token = await generateAccessToken(user, secret)
  account = buildAccount({ userId: user.id })
  await client.user.create({ data: user })
  await client.account.create({ data: account })
})

it("should return the current user", async () => {
  const res = await app.request(
    "/me",
    { headers: { Authorization: `Bearer ${token}` } },
    {
      DB: null,
      JWT_SECRET: secret,
    },
  )
  expect(res.status).toBe(200)
  expect(await res.json()).toEqual(
    json({ ...user, accounts: [serializeAccount(account)] }),
  )
})

describe("when the token is provided as a query parameter", () => {
  it("should return the current user", async () => {
    const res = await app.request(
      `/me?token=${token}`,
      {},
      {
        DB: null,
        JWT_SECRET: secret,
      },
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(
      json({ ...user, accounts: [serializeAccount(account)] }),
    )
  })
})
