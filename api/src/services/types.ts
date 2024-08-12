/* eslint-disable @typescript-eslint/no-explicit-any */

export type ServiceResultSuccess<T = null> = { success: true; data: T }
export type ServiceResultError<Map, Code extends keyof Map> = {
  success: false
  code: Code | "server_error"
  data: Map[Code]
}
export type ServiceResult<T, Map = undefined> =
  | ServiceResultSuccess<T>
  | ServiceResultError<Map, keyof Map>

export interface ServiceInstance<R = any, M = undefined> {
  call: (...args: any[]) => Promise<ServiceResult<R, M>>
}

export type ServiceErrorMap = {
  [key: string]: unknown
}

export type ServiceReturnType<S extends ServiceInstance> = Awaited<
  ReturnType<S["call"]>
>

export type ServiceSuccessData<S extends ServiceInstance> =
  Exclude<
    ServiceReturnType<S>,
    ServiceResultError<any, any>
  > extends ServiceResultSuccess<infer T>
    ? T
    : never
