import dayjs from "dayjs"
import { mockContext } from "spec/util"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ZodSchema } from "zod"
import { GoogleGateway } from "./google-gateway"

const token = "token"
const response = { ok: true }
const authOptions = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
  schema: expect.any(ZodSchema),
}

let gateway: GoogleGateway

function itReturnsTheResponse(fn: () => Promise<unknown>) {
  it("should return the response", async () => {
    const result = await fn()
    expect(result).toEqual({ success: true, data: response })
  })
}

beforeEach(() => {
  gateway = new GoogleGateway(mockContext)
  vi.spyOn(gateway, "call").mockImplementation(async function (
    this: GoogleGateway,
  ) {
    return this.success(response)
  })
})

describe("callWithToken", () => {
  const url = "http://localhost:5000"

  it("should call with the correct params", async () => {
    await gateway.callWithToken(token, url, authOptions.schema)
    expect(gateway.call).toHaveBeenCalledWith(url, authOptions)
  })

  itReturnsTheResponse(() =>
    gateway.callWithToken(token, url, expect.any(ZodSchema)),
  )

  describe("when response is not ok", () => {
    it("should return an error", async () => {
      const errorResponse = new Response("error", { status: 500 })
      vi.mocked(gateway.call).mockImplementationOnce(async function (
        this: GoogleGateway,
      ) {
        return this.failure("request_failed", errorResponse)
      })
      const result = await gateway.callWithToken(
        token,
        url,
        expect.any(ZodSchema),
      )

      expect(result).toEqual({
        success: false,
        code: "request_failed",
        data: errorResponse,
      })
    })
  })
})

describe("calendar", () => {
  const calendarId = "calendarId"
  const url = `https://www.googleapis.com/calendar/v3/users/me/calendarList/${calendarId}`

  it("should call request with the correct params", async () => {
    await gateway.getCalendar(token, calendarId)
    expect(gateway.call).toHaveBeenCalledWith(url, authOptions)
  })

  itReturnsTheResponse(() => gateway.getCalendar(token, calendarId))
})

describe("calendarList", () => {
  const url = "https://www.googleapis.com/calendar/v3/users/me/calendarList"

  it("should call request with the correct params", async () => {
    await gateway.getCalendarList(token)
    expect(gateway.call).toHaveBeenCalledWith(url, authOptions)
  })

  itReturnsTheResponse(() => gateway.getCalendarList(token))
})

describe("getEvents", () => {
  const calendarId = "calendarId"
  const baseUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`
  const params = {
    from: dayjs(),
    to: dayjs(),
  }

  it("should call request with the correct params", async () => {
    const url = new URL(baseUrl)
    url.searchParams.set("maxAttendees", "1")
    url.searchParams.set("orderBy", "startTime")
    url.searchParams.set("singleEvents", "true")
    url.searchParams.set("timeMin", params.from.toISOString())
    url.searchParams.set("timeMax", params.to.toISOString())

    await gateway.getEvents(token, calendarId, params)

    expect(gateway.call).toHaveBeenCalledWith(url, authOptions)
  })

  itReturnsTheResponse(() => gateway.getEvents(token, calendarId, params))

  describe("when from is not provided", () => {
    it("should not set timeMin", async () => {
      const url = new URL(baseUrl)
      url.searchParams.set("maxAttendees", "1")
      url.searchParams.set("orderBy", "startTime")
      url.searchParams.set("singleEvents", "true")
      url.searchParams.set("timeMax", params.to.toISOString())

      await gateway.getEvents(token, calendarId, { to: params.to })

      expect(gateway.call).toHaveBeenCalledWith(url, authOptions)
    })
  })

  describe("when to is not provided", () => {
    it("should not set timeMax", async () => {
      const url = new URL(baseUrl)
      url.searchParams.set("maxAttendees", "1")
      url.searchParams.set("orderBy", "startTime")
      url.searchParams.set("singleEvents", "true")
      url.searchParams.set("timeMin", params.from.toISOString())

      await gateway.getEvents(token, calendarId, { from: params.from })

      expect(gateway.call).toHaveBeenCalledWith(url, authOptions)
    })
  })

  describe("when from and to are not provided", () => {
    it("should not set timeMin and timeMax", async () => {
      const url = new URL(baseUrl)
      url.searchParams.set("maxAttendees", "1")
      url.searchParams.set("orderBy", "startTime")
      url.searchParams.set("singleEvents", "true")

      await gateway.getEvents(token, calendarId)

      expect(gateway.call).toHaveBeenCalledWith(url, authOptions)
    })
  })
})

describe("getProfile", () => {
  const url =
    "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos"

  it("should call request with the correct params", async () => {
    await gateway.getProfile(token)
    expect(gateway.call).toHaveBeenCalledWith(url, authOptions)
  })

  itReturnsTheResponse(() => gateway.getProfile(token))
})

describe("createCalendar", () => {
  const title = "title"
  const url = "https://www.googleapis.com/calendar/v3/calendars"

  it("should call request with the correct params", async () => {
    await gateway.createCalendar(token, title)
    expect(gateway.call).toHaveBeenCalledWith(url, {
      ...authOptions,
      method: "POST",
      json: { summary: title },
    })
  })

  itReturnsTheResponse(() => gateway.createCalendar(token, title))
})

describe("addCalendarToList", () => {
  const calendarId = "calendarId"
  const foregroundColor = "foregroundColor"
  const backgroundColor = "backgroundColor"
  const url =
    "https://www.googleapis.com/calendar/v3/users/me/calendarList?colorRgbFormat=true"
  const data = {
    id: calendarId,
    selected: true,
    backgroundColor,
    foregroundColor,
  }

  it("should call request with the correct params", async () => {
    await gateway.addCalendarToList(
      token,
      calendarId,
      foregroundColor,
      backgroundColor,
    )
    expect(gateway.call).toHaveBeenCalledWith(url, {
      ...authOptions,
      method: "POST",
      json: data,
    })
  })

  itReturnsTheResponse(() =>
    gateway.addCalendarToList(
      token,
      calendarId,
      foregroundColor,
      backgroundColor,
    ),
  )
})
