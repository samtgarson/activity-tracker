import { buildCalendar } from "spec/factories/calendar-factory"
import { mockContext, withAuth } from "spec/util"
import { serializeCalendar } from "src/serializers/calendar-serializer"
import { CalendarChooser } from "src/services/calendars/chooser"
import { CalendarCreator } from "src/services/calendars/creator"
import { CalendarFetcher } from "src/services/calendars/fetcher"
import { CalendarListFetcher } from "src/services/calendars/list-fetcher"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CalendarsRouter } from "."

vi.mock("src/services/calendars/list-fetcher", async () => ({
  CalendarListFetcher: vi.fn().mockReturnValue({
    call: vi.fn().mockReturnValue({
      success: true,
      data: [buildCalendar()],
    }),
  }),
}))

vi.mock("src/services/calendars/fetcher", async () => ({
  CalendarFetcher: vi.fn().mockReturnValue({
    call: vi.fn().mockReturnValue({
      success: true,
      data: buildCalendar(),
    }),
  }),
}))

vi.mock("src/services/calendars/chooser", async () => ({
  CalendarChooser: vi.fn().mockReturnValue({
    call: vi.fn().mockReturnValue({
      success: true,
      data: null,
    }),
  }),
}))

vi.mock("src/services/calendars/creator", async () => ({
  CalendarCreator: vi.fn().mockReturnValue({
    call: vi.fn().mockReturnValue({
      success: true,
      data: buildCalendar(),
    }),
  }),
}))

const account = mockContext.accounts[0]
const accountId = account.email
const router = withAuth(CalendarsRouter)

describe("GET /calendars", () => {
  describe("when service is successful", () => {
    const calendar = buildCalendar()

    beforeEach(() => {
      vi.mocked(new CalendarListFetcher(mockContext)).call.mockResolvedValue({
        success: true,
        data: [calendar],
      })
    })

    it("returns the list of calendars", async () => {
      const res = await router.request(`/calendars`)

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual([
        serializeCalendar(calendar, mockContext.accounts[0]),
      ])
    })
  })

  describe("when service fails", () => {
    beforeEach(() => {
      vi.mocked(new CalendarListFetcher(mockContext)).call.mockResolvedValue({
        success: false,
        code: "server_error",
        data: null,
      })
    })

    it("returns an error", async () => {
      const res = await router.request(`/calendars`)

      expect(res.status).toBe(500)
      expect(await res.json()).toEqual({ error: "server_error" })
    })
  })
})

describe("POST /calendars", () => {
  describe("when service is successful", () => {
    const calendar = buildCalendar()

    beforeEach(() => {
      vi.mocked(new CalendarCreator(mockContext)).call.mockResolvedValue({
        success: true,
        data: calendar,
      })
    })

    it("returns the created calendar", async () => {
      const res = await router.request(`/accounts/${accountId}/calendars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "title" }),
      })

      expect(res.status).toBe(201)
      expect(await res.json()).toEqual(
        serializeCalendar(calendar, mockContext.accounts[0]),
      )
    })

    it("calls the service with the correct title", async () => {
      await router.request(`/accounts/${accountId}/calendars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "title" }),
      })

      expect(new CalendarCreator(mockContext).call).toHaveBeenCalledWith(
        account,
        "title",
      )
    })
  })

  describe("when service fails", () => {
    beforeEach(() => {
      vi.mocked(new CalendarCreator(mockContext)).call.mockResolvedValue({
        success: false,
        code: "server_error",
        data: undefined,
      })
    })

    it("returns an error", async () => {
      const res = await router.request(`/accounts/${accountId}/calendars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "title" }),
      })

      expect(res.status).toBe(500)
      expect(await res.json()).toEqual({ error: "server_error" })
    })
  })

  describe("when the body is invalid", () => {
    it("returns an error", async () => {
      const res = await router.request(`/accounts/${accountId}/calendars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foo: "bar" }),
      })

      expect(res.status).toBe(400)
    })
  })
})

describe("GET /calendars/:calendarId", () => {
  const id = "calendarId"

  describe("when service is successful", () => {
    const calendar = buildCalendar()

    beforeEach(() => {
      vi.mocked(new CalendarFetcher(mockContext)).call.mockResolvedValue({
        success: true,
        data: calendar,
      })
    })

    it("returns the calendar", async () => {
      const res = await router.request(`/accounts/${accountId}/calendars/${id}`)

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual(serializeCalendar(calendar, account))
    })

    it("calls the service with the correct id", async () => {
      await router.request(`/accounts/${accountId}/calendars/${id}`)

      expect(new CalendarFetcher(mockContext).call).toHaveBeenCalledWith(
        account,
        id,
      )
    })
  })

  describe("when service fails", () => {
    beforeEach(() => {
      vi.mocked(new CalendarFetcher(mockContext)).call.mockResolvedValue({
        success: false,
        code: "server_error",
        data: undefined,
      })
    })

    it("returns an error", async () => {
      const res = await router.request(`/accounts/${accountId}/calendars/${id}`)

      expect(res.status).toBe(500)
      expect(await res.json()).toEqual({ error: "server_error" })
    })
  })
})

describe("POST /calendars/:calendarId/choose", () => {
  const id = "calendarId"

  describe("when service is successful", () => {
    it("returns success", async () => {
      const res = await router.request(
        `/accounts/${accountId}/calendars/${id}/choose`,
        {
          method: "POST",
        },
      )

      expect(res.status).toBe(201)
      expect(await res.json()).toEqual({ success: true })
    })

    it("calls the service with the correct id", async () => {
      await router.request(`/accounts/${accountId}/calendars/${id}/choose`, {
        method: "POST",
      })

      expect(new CalendarChooser(mockContext).call).toHaveBeenCalledWith(
        account,
        id,
      )
    })
  })

  describe("when service fails", () => {
    beforeEach(() => {
      vi.mocked(new CalendarChooser(mockContext)).call.mockResolvedValue({
        success: false,
        code: "server_error",
        data: null as never,
      })
    })

    it("returns an error", async () => {
      const res = await router.request(
        `/accounts/${accountId}/calendars/${id}/choose`,
        {
          method: "POST",
        },
      )

      expect(res.status).toBe(500)
      expect(await res.json()).toEqual({ error: "server_error" })
    })
  })
})
