import { Context, Hono } from "hono"
import { Config, Variables } from "src/types/config"

type Ctx = { Bindings: Config; Variables: Variables }

export function newHono() {
  return new Hono<Ctx>()
}

export type HonoContext = Context<Ctx>
