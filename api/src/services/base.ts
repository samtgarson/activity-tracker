/* eslint-disable @typescript-eslint/no-explicit-any */

import { PrismaDb, prisma } from "prisma/client"
import { ServiceResultError, ServiceResultSuccess } from "./types"
import { HasRequestContext, ServiceInput } from "./util/service-context"
export { ServiceContext } from "./util/service-context"
export type { ServiceInput } from "./util/service-context"

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
