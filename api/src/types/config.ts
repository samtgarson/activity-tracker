import { D1Database } from "@cloudflare/workers-types"
import { ServiceContext } from "src/services/base"

export type Config = {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  JWT_SECRET: string
  DB: D1Database
}

export type Variables = {
  ctx: ServiceContext
}
