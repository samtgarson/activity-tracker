import { z } from 'zod'

export const idObjectSchema = z.object({
  id: z.string()
})
