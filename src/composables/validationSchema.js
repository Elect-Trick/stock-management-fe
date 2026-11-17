// Lets gaurd for overflow 
const INT32_MIN = -2147483648
const INT32_MAX = 2147483647


import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'


export const formValidationSchema = toTypedSchema(
  z.object({
    title: z.string().min(6, 'Title should be at least 6 characters').max(20, 'Name must be at most 20 characters'),
quantity: z
  .string()
  .min(1, 'Quantity is required')
  .regex(/^-?\d+$/, 'Quantity must be an integer')
  .refine(
    (val) => {
      const n = Number(val)
      return n >= INT32_MIN && n <= INT32_MAX
    },
    { message: `Quantity must be between ${INT32_MIN} and ${INT32_MAX}` })})
)

