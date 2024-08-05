import { D1Database } from "@cloudflare/workers-types"
import { ServiceInput } from "src/services/base"
import { buildUser } from "./factories/user-factory"

export const mockContext = {
  env: {
    GOOGLE_CLIENT_ID: "123",
    GOOGLE_CLIENT_SECRET: "456",
    JWT_SECRET: "789",
    DB: {} as unknown as D1Database,
  },
  url: new URL("http://localhost"),
  user: buildUser(),
} satisfies ServiceInput
