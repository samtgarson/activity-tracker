import { D1Database } from "@cloudflare/workers-types"

export type Config = {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  JWT_SECRET: string
  DB: D1Database
}
