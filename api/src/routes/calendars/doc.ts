import { createRoute as createApiRoute, z } from "@hono/zod-openapi"
import { calendarSchema } from "src/models/schemas"
import { errorSchema } from "../util"

export const indexRoute = createApiRoute({
  method: "get",
  tags: ["Calendars"],
  operationId: "listCalendars",
  path: "/calendars",
  responses: {
    200: {
      description: "List calendars from all accounts",
      content: {
        "application/json": {
          schema: z.array(calendarSchema),
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

export const createRoute = createApiRoute({
  method: "post",
  tags: ["Calendars"],
  operationId: "createCalendar",
  path: "/accounts/{accountId}/calendars",
  request: {
    params: z.object({ accountId: z.string().min(1) }),
    body: {
      content: {
        "application/json": {
          schema: z.object({ title: z.string().min(1) }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created calendar",
      content: {
        "application/json": {
          schema: calendarSchema,
        },
      },
    },
    404: {
      description: "Account not found",
      content: {
        "application/json": {
          schema: z.object({ error: z.literal("account_not_found") }),
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

export const showRoute = createApiRoute({
  method: "get",
  tags: ["Calendars"],
  operationId: "getCalendar",
  path: "/accounts/{accountId}/calendars/{calendarId}",
  request: {
    params: z.object({
      accountId: z.string().min(1),
      calendarId: z.string().min(1),
    }),
  },
  responses: {
    200: {
      description: "Calendar found",
      content: {
        "application/json": {
          schema: calendarSchema,
        },
      },
    },
    404: {
      description: "Resource not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.enum(["calendar_not_found", "account_not_found"]),
          }),
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

export const chooseRoute = createApiRoute({
  method: "post",
  tags: ["Calendars"],
  operationId: "chooseCalendar",
  path: "/accounts/{accountId}/calendars/{calendarId}/choose",
  request: {
    params: z.object({
      accountId: z.string().min(1),
      calendarId: z.string().min(1),
    }),
  },
  responses: {
    201: {
      description: "Choose calendar",
    },
    404: {
      description: "Resource not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.enum(["calendar_not_found", "account_not_found"]),
          }),
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
