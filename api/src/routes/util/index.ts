import { OpenAPIHono, z } from "@hono/zod-openapi"
import { Context } from "hono"
import { Config, Variables } from "src/types/config"

export type Ctx = { Bindings: Config; Variables: Variables }

export function newHono() {
  return new OpenAPIHono<Ctx>()
}

export type HonoContext = Context<Ctx>

export const fiveHundredSchema = z.object({
  error: z.string(),
})
