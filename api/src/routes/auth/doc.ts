import { createRoute, z } from "@hono/zod-openapi"
import { providerSchema } from "src/models/schemas"
import { fiveHundredSchema } from "../util"

export const loginRoute = createRoute({
  method: "get",
  tags: ["Authentication"],
  operationId: "login",
  path: "/auth/login/:provider",
  request: {
    params: z.object({
      provider: providerSchema,
    }),
    query: z.object({
      external: z.coerce.boolean().optional(),
    }),
  },
  responses: {
    302: {
      description: "Redirect to the provider's login page",
      headers: z.object({ Location: z.string() }),
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

export const refreshRoute = createRoute({
  method: "post",
  tags: ["Authentication"],
  operationId: "refreshAccessToken",
  path: "/auth/refresh",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ refreshToken: z.string() }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Refreshed access token",
      content: {
        "application/json": {
          schema: z.object({ accessToken: z.string() }),
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
