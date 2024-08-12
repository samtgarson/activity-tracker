import { beforeEach, describe, expect, it, vi } from "vitest"
import { ServiceResult } from "../types"
import { organize } from "./organize"

const exec = vi.fn(
  async (a: number): Promise<ServiceResult<number>> =>
    ({ success: true, data: 10 + a }) as const,
)
const args = [1, 2, 3]

describe("without keyBy", () => {
  describe("when the service succeeds", () => {
    it("returns a success result with the data", async () => {
      const result = await organize(args, exec)

      expect(result).toEqual({ success: true, data: [11, 12, 13] })
    })

    it("executes the service for each argument", async () => {
      await organize(args, exec)

      expect(exec).toHaveBeenCalledTimes(3)
      expect(exec).toHaveBeenCalledWith(1)
      expect(exec).toHaveBeenCalledWith(2)
      expect(exec).toHaveBeenCalledWith(3)
    })

    describe("with keyBy", () => {
      const keyBy = (a: number) => a.toString()

      it("returns a success result with the data", async () => {
        const result = await organize(args, exec, keyBy)

        expect(result).toEqual({
          success: true,
          data: { "1": 11, "2": 12, "3": 13 },
        })
      })
    })
  })

  describe("when the second service fails", () => {
    beforeEach(() => {
      vi.mocked(exec).mockImplementation(async (a: number) => {
        if (a === 2)
          return {
            success: false,
            code: "server_error",
            data: null as never,
          }
        return { success: true, data: 10 + a }
      })
    })

    it("returns the error result", async () => {
      const result = await organize(args, exec)

      expect(result).toEqual({
        success: false,
        code: "server_error",
        data: null,
      })
    })

    it("does not execute the third iteration", async () => {
      await organize(args, exec)

      expect(exec).toHaveBeenCalledTimes(2)
      expect(exec).toHaveBeenCalledWith(1)
      expect(exec).toHaveBeenCalledWith(2)
    })
  })
})
