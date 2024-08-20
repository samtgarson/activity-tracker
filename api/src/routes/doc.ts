import { createRoute, z } from "@hono/zod-openapi"
import { userSchema } from "src/models/schemas"

export const docConfig = {
  info: {
    title: "Activity Tracker API",
    version: "v0.0.1",
  },
  openapi: "3.0.0",
  servers: [
    {
      url: "http://localhost:8787/",
      description: "Local development server",
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
}

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
          schema: userSchema,
        },
      },
    },
  },
})
