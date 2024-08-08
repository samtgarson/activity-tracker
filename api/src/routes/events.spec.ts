import dayjs from "dayjs"
import { buildEvent } from "spec/factories/event-factory"
import { mockContext, withAuth } from "spec/util"
import { EventListFetcher } from "src/services/events/list-fetcher"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventsRouter } from "./events"

vi.mock("src/services/events/list-fetcher", async () => ({
  EventListFetcher: vi.fn().mockReturnValue({
    call: vi.fn().mockReturnValue({
      success: true,
      data: [buildEvent()],
    }),
  }),
}))

describe("GET /events", () => {
  const router = withAuth(EventsRouter)

  describe("when service is successful", () => {
    const event = buildEvent()

    beforeEach(() => {
      vi.mocked(new EventListFetcher(mockContext)).call.mockResolvedValue({
        success: true,
        data: [event],
      })
    })

    it("returns the list of calendars", async () => {
      const res = await router.request("/")

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual([
        {
          ...event,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
        },
      ])
    })

    describe("when from and to are provided", () => {
      const from = "2021-01-01"
      const to = "2021-01-02"

      it("calls the service with the correct arguments", async () => {
        const res = await router.request(`/?from=${from}&to=${to}`)

        expect(res.status).toBe(200)
        expect(new EventListFetcher(mockContext).call).toHaveBeenCalledWith({
          from: dayjs(from),
          to: dayjs(to),
        })
      })
    })

    describe("when from is provided", () => {
      const from = "2021-01-01"

      it("calls the service with the correct arguments", async () => {
        const res = await router.request(`/?from=${from}`)

        expect(res.status).toBe(200)
        expect(new EventListFetcher(mockContext).call).toHaveBeenCalledWith({
          from: dayjs(from),
          to: undefined,
        })
      })
    })

    describe("when from or to are invalid", () => {
      it("returns an error", async () => {
        const res = await router.request(`/?from=invalid`)

        expect(res.status).toBe(400)
      })

      it("returns an error", async () => {
        const res = await router.request(`/?to=invalid`)

        expect(res.status).toBe(400)
      })
    })
  })

  describe("when service fails", () => {
    beforeEach(() => {
      vi.mocked(new EventListFetcher(mockContext)).call.mockResolvedValue({
        success: false,
        code: "server_error",
        data: null,
      })
    })

    it("returns an error", async () => {
      const res = await router.request("/")

      expect(res.status).toBe(500)
      expect(await res.json()).toEqual({ error: "server_error" })
    })
  })
})
