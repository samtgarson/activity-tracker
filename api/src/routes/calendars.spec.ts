import { mockContext } from "spec/util"
import { CalendarListFetcher } from "src/services/calendars/list-fetcher"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CalendarsRouter } from "./calendars"

vi.mock("src/services/calendars/list-fetcher", async () => ({
  CalendarListFetcher: vi.fn().mockReturnValue({
    call: vi.fn().mockReturnValue({
      success: true,
      data: [{ id: 1 }],
    }),
  }),
}))

describe("GET /calendars", () => {
  describe("when service is successful", () => {
    it("returns the list of calendars", async () => {
      const res = await CalendarsRouter.request("/")

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual([{ id: 1 }])
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
      const res = await CalendarsRouter.request("/")

      expect(res.status).toBe(500)
      expect(await res.json()).toEqual({ error: "server_error" })
    })
  })
})
