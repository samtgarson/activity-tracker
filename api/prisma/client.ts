import { D1Database } from "@cloudflare/workers-types"
import { PrismaD1 } from "@prisma/adapter-d1"
import { Prisma, PrismaClient } from "@prisma/client"
import { Provider } from "src/models/types"
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
type Model<T extends Prisma.TypeMap["meta"]["modelProps"]> = Awaited<
  ReturnType<PrismaClientExt[T]["findFirstOrThrow"]>
>
export type User = Model<"user">
export interface Account extends Model<"account"> {
  provider: Provider
}
export type RefreshToken = Model<"refreshToken">
export type { Prisma }
