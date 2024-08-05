import { D1Database } from "@cloudflare/workers-types"
import { User } from "prisma/client"

export type Config = {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  JWT_SECRET: string
  DB: D1Database
}

export type Variables = {
  user: User
}
