/* eslint-disable @typescript-eslint/no-explicit-any */

import { Account, PrismaDb, User, prisma } from "prisma/client"
import { HonoContext } from "src/routes/util"
import { Config } from "src/types/config"

export type ServiceResultSuccess<T = null> = { success: true; data: T }
export type ServiceResultError<Map, Code extends keyof Map> = {
  success: false
  code: Code | "server_error"
  data: Map[Code]
}
export type ServiceResult<T, Map = undefined> =
  | ServiceResultSuccess<T>
  | ServiceResultError<Map, keyof Map>

export type ResultType<T extends Service<any>> = Awaited<
  ReturnType<Exclude<T["call"], undefined>>
>

export type ServiceErrorMap = {
  [key: string]: unknown
}

export type ServiceContext = {
  env: Config
  url: URL
  user: User
  activeAccount?: Account
}

export type ServiceInput =
  | (Pick<HonoContext, "env" | "var"> & {
      req: Pick<Request, "url">
    })
  | ServiceContext

export class HasRequestContext {
  protected ctx: ServiceContext
  constructor(ctx: ServiceInput) {
    if (isContext(ctx)) {
      this.ctx = ctx
    } else {
      this.ctx = {
        env: ctx.env,
        url: new URL(ctx.req.url),
        get user() {
          return ctx.var.user
        },
        get activeAccount() {
          return ctx.var.activeAccount
        },
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

  /* istanbul ignore next */
  protected debug(...message: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    console.debug(`[${this.constructor.name}]`, ...message)
  }
}

function isContext(ctx: unknown): ctx is ServiceContext {
  return typeof ctx === "object" && !!ctx && "url" in ctx
}
