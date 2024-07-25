/* eslint-disable @typescript-eslint/no-explicit-any */

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

export type InputRequest =
  | (Pick<HonoContext, "env"> & {
    req: Pick<Request, "url">
  })
  | Context

export class HasRequestContext {
  protected ctx: Context
  constructor(ctx: InputRequest) {
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

export abstract class Service<
  ReturnType = null,
  ErrorMap = undefined,
> extends HasRequestContext {
  abstract call(
    ...args: any[]
  ): Promise<
    | ServiceResultSuccess<ReturnType>
    | ServiceResultError<ErrorMap, keyof ErrorMap>
  >

  protected success<T = ReturnType>(data: T): ServiceResultSuccess<T> {
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

export type ResultType<T extends Service<any, any>> = Awaited<
  ReturnType<T["call"]>
>

function isContext(ctx: unknown): ctx is Context {
  return (ctx as Context).url !== undefined
}
