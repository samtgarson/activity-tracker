import { OpenAPIHono, z } from "@hono/zod-openapi"
import { Context } from "hono"
import { Config, Variables } from "src/types/config"

export type Ctx = { Bindings: Config; Variables: Variables }

export function newHono() {
  return new OpenAPIHono<Ctx>({
    defaultHook: (result, c) => {
      if (result.success) return

      return c.json(
        {
          errors: result.error.format()._errors,
        },
        400,
      )
    },
  })
}

export type HonoContext = Context<Ctx>

export const fiveHundredSchema = z.object({
  error: z.string(),
})
