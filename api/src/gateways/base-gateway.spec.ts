import { mockContext } from "spec/util"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"
import { BaseGateway } from "./base-gateway"

class TestGateway extends BaseGateway {}
const fetch = vi.fn()
const gateway = new TestGateway(mockContext, fetch)
const json = vi.fn(async () => ({ foo: "bar" }))
const schema = z.object({ foo: z.string() })
vi.spyOn(schema, "safeParse")

describe("call", () => {
  describe("when request is successful", () => {
    it("should return the response", async () => {
      fetch.mockResolvedValue({ ok: true, json })
      const res = await gateway.call(new URL("http://localhost"), {
        method: "GET",
        schema,
      })

      expect(json).toHaveBeenCalled()
      expect(res).toEqual({ success: true, data: { foo: "bar" } })
    })

    it("should call with the correct params", async () => {
      fetch.mockResolvedValue({ ok: true, json })
      await gateway.call(new URL("http://localhost"), {
        method: "GET",
        schema,
      })

      expect(fetch).toHaveBeenCalledWith(new URL("http://localhost"), {
        method: "GET",
      })
    })

    describe("when options are not provided", () => {
      it("should call with the correct params", async () => {
        fetch.mockResolvedValue({ ok: true, json })
        await gateway.call(new URL("http://localhost"), { schema })

        expect(fetch).toHaveBeenCalledWith(new URL("http://localhost"), {})
      })
    })

    describe("when json is provided", () => {
      it("should stringify the json", async () => {
        fetch.mockResolvedValue({ ok: true, json })
        await gateway.call(new URL("http://localhost"), {
          method: "POST",
          json: { key: "value" },
          schema,
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
      const response = { ok: false, text: vi.fn(async () => "error") }
      fetch.mockResolvedValue(response)
      const res = await gateway.call(new URL("http://localhost"), {
        method: "GET",
        schema,
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
        schema,
      })

      expect(res).toEqual({
        success: false,
        code: "server_error",
        data: new Error("error"),
      })
    })
  })

  describe("when response is invalid", () => {
    beforeEach(() => {
      vi.mocked(schema.safeParse).mockReturnValue({
        success: false,
        error: expect.anything(),
      })
    })

    it("should return an error", async () => {
      fetch.mockResolvedValue({ ok: true, json })
      const res = await gateway.call(new URL("http://localhost"), {
        method: "GET",
        schema,
      })

      expect(res).toEqual({
        success: false,
        code: "invalid_response",
        data: null,
      })
    })
  })
})
