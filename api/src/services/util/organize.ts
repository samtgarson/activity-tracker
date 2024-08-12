/* eslint-disable @typescript-eslint/no-explicit-any */

import { zipToObject } from "radash"
import { ServiceResult } from "../types"

// Overload 1: without keyBy, returns an array
export async function organize<
  P,
  Result extends ServiceResult<any, any>,
  DataType extends Result extends ServiceResult<infer T> ? T : never,
  Map extends Result extends ServiceResult<any, infer M> ? M : undefined,
>(
  params: P[],
  run: (param: P) => Promise<ServiceResult<DataType, Map>>,
): Promise<ServiceResult<DataType[], Map>>

// Overload 2: with keyBy, returns an object
export async function organize<
  P,
  Result extends ServiceResult<any, any>,
  DataType extends Result extends ServiceResult<infer T> ? T : never,
  Map extends Result extends ServiceResult<any, infer M> ? M : undefined,
>(
  params: P[],
  run: (param: P) => Promise<ServiceResult<DataType, Map>>,
  keyBy: (param: P) => string,
): Promise<ServiceResult<Record<string, DataType>, Map>>

// Implementation
export async function organize<
  P,
  Result extends ServiceResult<any, any>,
  DataType extends Result extends ServiceResult<infer T> ? T : never,
  Map extends Result extends ServiceResult<any, infer M> ? M : undefined,
>(
  params: P[],
  run: (param: P) => Promise<ServiceResult<DataType, Map>>,
  keyBy?: (param: P) => string,
): Promise<
  ServiceResult<Record<string, DataType>, Map> | ServiceResult<DataType[], Map>
> {
  const results: DataType[] = []
  for (const param of params) {
    const result = await run(param)
    if (!result.success) return result
    results.push(result.data)
  }

  if (keyBy) {
    const data = zipToObject(params.map(keyBy), results)
    return { success: true, data }
  } else {
    return { success: true, data: results }
  }
}
