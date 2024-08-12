import { D1Database } from "@cloudflare/workers-types"
import { prisma } from "prisma/client"
import { buildAccount } from "spec/factories/account-factory"
import { buildUser } from "spec/factories/user-factory"
import { json } from "spec/util/matchers"
import app from "src"
import { serializeAccount } from "src/serializers/account-serializer"
import { generateAccessToken } from "src/services/auth/utils/tokens"
import { beforeEach, expect, it } from "vitest"

console.error = console.debug
const user = buildUser()
const account = buildAccount({ userId: user.id })
const client = prisma({} as D1Database)
const secret = "secret"
let token: string

beforeEach(async () => {
  token = await generateAccessToken(user, secret)
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
