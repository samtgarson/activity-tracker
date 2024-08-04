/* eslint-disable @typescript-eslint/no-explicit-any */

import { PrismaDb, prisma } from "prisma/client"
import { HonoContext } from "src/routes/util"
import { Config } from "src/types/config"

export type ServiceResultSuccess<T = null> = { success: true; data: T }
export type ServiceResultError<Map, Code extends keyof Map> = {
  success: false
  code: Code | "server_error"
  data: Map[Code]
}

export type ServiceErrorMap = {
  [key: string]: unknown
}

type Context = {
  env: Config
  url: URL
}

export type ServiceInput =
  | (Pick<HonoContext, "env"> & {
      req: Pick<Request, "url">
    })
  | Context

export class HasRequestContext {
  protected ctx: Context
  constructor(ctx: ServiceInput) {
    if (isContext(ctx)) {
      this.ctx = ctx
    } else {
      this.ctx = {
        env: ctx.env,
        url: new URL(ctx.req.url),
      }
    }
  }
}

export abstract class Service<ErrorMap = undefined> extends HasRequestContext {
  db: PrismaDb

  constructor(ctx: ServiceInput) {
    super(ctx)
    this.db = prisma(ctx.env.DB)
  }

  abstract call?(
    ...args: any[]
  ): Promise<
    ServiceResultSuccess<any> | ServiceResultError<ErrorMap, keyof ErrorMap>
  >

  protected success<T>(data: T): ServiceResultSuccess<T> {
    return { success: true as const, data: data }
  }

  protected failure<Code extends keyof ErrorMap, Data extends ErrorMap[Code]>(
    ...[code, data]: ErrorMap extends undefined
      ? []
      : Data extends undefined
        ? [Code]
        : [Code, Data]
  ): ServiceResultError<ErrorMap, Code> {
    return {
      success: false as const,
      code: code || "server_error",
      data: data as Data,
    }
  }
}

export type ResultType<T extends Service<any>> = Awaited<
  ReturnType<Exclude<T["call"], undefined>>
>

function isContext(ctx: unknown): ctx is Context {
  return typeof ctx === "object" && !!ctx && "url" in ctx
}
