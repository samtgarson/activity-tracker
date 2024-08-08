import dayjs from "dayjs"
import { camel, mapKeys } from "radash"
import { z } from "zod"

export const idObjectSchema = z.object({
  id: z.string(),
})

export function camelize<S extends z.ZodTypeAny>(schema: S) {
  return z
    .record(z.any())
    .transform((res) => mapKeys(res, camel))
    .pipe(schema)
}

export const apiDate = z
  .string()
  .date()
  .transform((d) => dayjs(d))

export const flexibleDate = z
  .string()
  .transform((d) => dayjs(d))
  .refine((d) => d.isValid(), { message: "Invalid date" })
  .transform((d) => d.toDate())
