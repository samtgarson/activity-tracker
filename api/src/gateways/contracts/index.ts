import { camel, mapKeys } from "radash"
import { z } from "zod"

export function camelize<S extends z.ZodTypeAny>(schema: S) {
  return z
    .record(z.any())
    .transform((res) => mapKeys(res, camel))
    .pipe(schema)
}

export const idObjectSchema = z.object({
  id: z.string(),
})
