/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Service,
  ServiceInput,
  ServiceResultError,
  ServiceResultSuccess,
} from "src/services/base"
import { z } from "zod"
import { GatewayErrors } from "./types"

export interface GatewayOptions<Schema extends z.ZodTypeAny>
  extends RequestInit {
  json?: Record<string, unknown>
  schema: Schema
}

export type GatewayOutput<G extends BaseGateway> = {
  [k in Exclude<keyof G, "call" | "db">]: G[k] extends (
    ...args: any[]
  ) => Promise<any>
    ? Exclude<
        Awaited<ReturnType<G[k]>>,
        ServiceResultError<any, any>
      > extends ServiceResultSuccess<infer T>
      ? T
      : Exclude<Awaited<ReturnType<G[k]>>, ServiceResultError<any, any>>
    : never
}

export abstract class BaseGateway extends Service<GatewayErrors> {
  constructor(
    ctx: ServiceInput,
    protected fetch = globalThis.fetch.bind(globalThis),
    // private authClient: AccessTokenFetcher = new GoogleAccessTokenFetcher()
  ) {
    super(ctx)
  }

  async call<Schema extends z.ZodTypeAny>(
    url: string | URL,
    { json, schema, ...options }: GatewayOptions<Schema>,
  ) {
    try {
      const res = await this.fetch(url, {
        ...options,
        body: json ? JSON.stringify(json) : options?.body,
      })

      if (!res.ok) {
        console.error(await res.text())
        return this.failure("request_failed", res)
      }

      const data = await res.json()
      const parsed = schema.safeParse(data)
      if (parsed.success) {
        return this.success(parsed.data as z.infer<Schema>)
      }

      console.error(
        url,
        JSON.stringify(data, null, 2),
        JSON.stringify(parsed.error.errors, null, 2),
      )
      return this.failure("invalid_response", null)
    } catch (e) {
      console.error(e)
      return this.failure("server_error", e)
    }
  }
}
