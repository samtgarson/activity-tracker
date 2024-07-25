/* eslint-disable @typescript-eslint/no-explicit-any */

export type ServiceResultSuccess<T = null> = { success: true; data: T }
export type ServiceResultError<Code, Data = undefined> = {
  success: false
  code: Code
  data: Data
}

export type ServiceErrorMap = {
  [key: string]: unknown
}

export abstract class Service<ReturnType = null, ErrorMap = undefined> {
  abstract call(
    ...args: any[]
  ): Promise<ServiceResultSuccess<ReturnType> | ServiceResultError<any, any>>

  protected success<T = ReturnType>(data: T): ServiceResultSuccess<T> {
    return { success: true as const, data: data }
  }

  protected failure<Code extends keyof ErrorMap, Data extends ErrorMap[Code]>(
    ...[code, data]: Data extends undefined ? [Code] : [Code, Data]
  ): ServiceResultError<Code, Data> {
    return { success: false as const, code, data: data as Data }
  }
}

export type ResultType<T extends Service<any, any>> = Awaited<
  ReturnType<T['call']>
>
