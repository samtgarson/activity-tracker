import { D1Database } from "@cloudflare/workers-types"
import { PrismaD1 } from "@prisma/adapter-d1"
import { Prisma, PrismaClient } from "@prisma/client"
import { userExtension } from "src/models/user"

const prismaClientSingleton = () => {
  return (db: D1Database) => {
    const adapter =
      typeof process !== "undefined" && process.env.TEST
        ? null
        : new PrismaD1(db)
    return userExtension(new PrismaClient({ adapter }))
  }
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

export type PrismaDb = ReturnType<ReturnType<typeof prismaClientSingleton>>

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma

type PrismaClientExt = ReturnType<typeof globalThis.prismaGlobal>
type Models = {
  [key in Prisma.TypeMap["meta"]["modelProps"]]: Awaited<
    ReturnType<PrismaClientExt[key]["findFirstOrThrow"]>
  >
}
export type User = Models["user"]
export type Account = Models["account"]
export type RefreshToken = Models["refreshToken"]
export type { Prisma }
