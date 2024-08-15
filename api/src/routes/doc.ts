import { createRoute, z } from "@hono/zod-openapi"
import { accountSchema, userSchema } from "src/models/schemas"

export const pingRoute = createRoute({
  method: "get",
  tags: ["Application"],
  operationId: "ping",
  path: "/",
  responses: {
    200: {
      description: "Ping the server",
      content: {
        "application/json": {
          schema: z.object({ beep: z.literal("boop") }),
        },
      },
    },
  },
})

export const meRoute = createRoute({
  method: "get",
  tags: ["Application"],
  operationId: "getCurrentUser",
  path: "/me",
  responses: {
    200: {
      description: "Get the current user",
      content: {
        "application/json": {
          schema: userSchema.extend({
            accounts: z.array(accountSchema),
          }),
        },
      },
    },
  },
})
