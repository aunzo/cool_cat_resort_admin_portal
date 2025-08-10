import { z } from 'zod'

// Zod schema for user validation
export const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  taxId: z.string().min(1, 'Tax ID is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

// TypeScript type derived from Zod schema
export type User = z.infer<typeof UserSchema>

// Type for creating a new user (without id, createdAt, updatedAt)
export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>

// Type for updating a user
export type UpdateUserData = Partial<Omit<User, 'id' | 'createdAt'>> & { id: string }

// Schema for form validation (without server-generated fields)
export const UserFormSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})