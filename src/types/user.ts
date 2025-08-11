import { z } from 'zod'

export interface User {
  id: string
  username: string
  password: string
  name: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  username: string
  password: string
  name: string
  role?: string
}

export interface UpdateUserData {
  username?: string
  name?: string
  role?: string
}

export interface LoginData {
  username: string
  password: string
}

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

export const CreateUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.string().optional().default('admin')
})

export type LoginFormData = z.infer<typeof LoginSchema>
export type CreateUserFormData = z.infer<typeof CreateUserSchema>