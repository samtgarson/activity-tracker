import { mockContext } from "spec/util"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { GoogleGateway } from "./google-gateway"

const token = "token"
const response = { ok: true }
const authOptions = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
}

let gateway: GoogleGateway

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
    await gateway.callWithToken(token, url)
    expect(gateway.call).toHaveBeenCalledWith(url, authOptions)
  })

  it("should return the response", async () => {
    const result = await gateway.callWithToken(token, url)
    expect(result).toEqual({ success: true, data: response })
  })

  describe("when response is not ok", () => {
    it("should return an error", async () => {
      const errorResponse = new Response("error", { status: 500 })
      vi.mocked(gateway.call).mockImplementationOnce(async function (
        this: GoogleGateway,
      ) {
        return this.failure("request_failed", errorResponse)
      })
      const result = await gateway.callWithToken(token, url)

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
})

describe("calendarList", () => {
  const url = "https://www.googleapis.com/calendar/v3/users/me/calendarList"

  it("should call request with the correct params", async () => {
    await gateway.getCalendarList(token)
    expect(gateway.call).toHaveBeenCalledWith(url, authOptions)
  })
})

describe("events", () => {
  const calendarId = "calendarId"
  const baseUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`
  const params = {
    from: new Date(),
    to: new Date(),
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
})

describe("getProfile", () => {
  const url = "https://people.googleapis.com/v1/people/me"

  it("should call request with the correct params", async () => {
    await gateway.getProfile(token)
    expect(gateway.call).toHaveBeenCalledWith(url, authOptions)
  })
})
