import { mockContext } from "spec/util"
import { describe, expect, it, vi } from "vitest"
import { BaseGateway } from "./base-gateway"

const fetch = vi.fn()
const gateway = new BaseGateway(mockContext, fetch)
const json = vi.fn(async () => "response")

describe("call", () => {
  describe("when request is successful", () => {
    it("should return the response", async () => {
      fetch.mockResolvedValue({ ok: true, json })
      const res = await gateway.call(new URL("http://localhost"), {
        method: "GET",
      })

      expect(json).toHaveBeenCalled()
      expect(res).toEqual({ success: true, data: "response" })
    })

    it("should call with the correct params", async () => {
      fetch.mockResolvedValue({ ok: true, json })
      await gateway.call(new URL("http://localhost"), {
        method: "GET",
      })

      expect(fetch).toHaveBeenCalledWith(new URL("http://localhost"), {
        method: "GET",
      })
    })

    describe("when json is provided", () => {
      it("should stringify the json", async () => {
        fetch.mockResolvedValue({ ok: true, json })
        await gateway.call(new URL("http://localhost"), {
          method: "POST",
          json: { key: "value" },
        })

        expect(fetch).toHaveBeenCalledWith(new URL("http://localhost"), {
          method: "POST",
          body: '{"key":"value"}',
        })
      })
    })
  })

  describe("when request is not successful", () => {
    it("should return an error", async () => {
      const response = { ok: false }
      fetch.mockResolvedValue(response)
      const res = await gateway.call(new URL("http://localhost"), {
        method: "GET",
      })

      expect(res).toEqual({
        success: false,
        code: "request_failed",
        data: response,
      })
    })
  })

  describe("when request throws an error", () => {
    it("should return an error", async () => {
      fetch.mockRejectedValue(new Error("error"))
      const res = await gateway.call(new URL("http://localhost"), {
        method: "GET",
      })

      expect(res).toEqual({
        success: false,
        code: "server_error",
        data: new Error("error"),
      })
    })
  })
})
