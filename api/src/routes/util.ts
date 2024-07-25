import { Hono, Context } from "hono"
import { Config } from "src/types/config"

export function newHono() {
  return new Hono<{ Bindings: Config }>()
}

export type HonoContext = Context<{ Bindings: Config }>
