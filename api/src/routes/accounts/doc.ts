import { createRoute } from "@hono/zod-openapi"
import { z } from "zod"
import { errorSchema } from "../util"

export const deleteRoute = createRoute({
  method: "delete",
  tags: ["Accounts"],
  operationId: "disconnectAccount",
  path: "/accounts/{id}",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: {
      description: "Account disconnected successfully",
    },
    404: {
      description: "Account not found",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
})
