import { z } from 'zod'

// Zod schema for customer validation
export const CustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  taxId: z.string().min(1, 'Tax ID is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

// TypeScript type derived from Zod schema
export type Customer = z.infer<typeof CustomerSchema>

// Type for creating a new customer (without id, createdAt, updatedAt)
export type CreateCustomerData = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>

// Type for updating a customer
export type UpdateCustomerData = Partial<Omit<Customer, 'id' | 'createdAt'>> & { id: string }

// Schema for form validation (without server-generated fields)
export const CustomerFormSchema = CustomerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})