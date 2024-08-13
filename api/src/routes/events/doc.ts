import { createRoute } from "@hono/zod-openapi"
import { apiDate } from "src/gateways/contracts"
import { eventSchema } from "src/models/schemas"
import { z } from "zod"
import { fiveHundredSchema } from "../util"

const querySchema = z.object({
  from: apiDate.optional(),
  to: apiDate.optional(),
})

export const route = createRoute({
  method: "get",
  path: "/events",
  request: {
    query: querySchema,
  },
  responses: {
    200: {
      description: "List events from all accounts",
      content: {
        "application/json": {
          schema: z.array(eventSchema),
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: fiveHundredSchema,
        },
      },
    },
  },
})
