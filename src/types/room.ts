import { z } from 'zod'

// Zod schema for room validation (simplified with only name and price)
export const RoomSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Room name is required'),
  price: z.number().min(0, 'Price must be positive'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

// TypeScript type derived from Zod schema
export type Room = z.infer<typeof RoomSchema>

// Type for creating a new room (without id, createdAt, updatedAt)
export type CreateRoomData = Omit<Room, 'id' | 'createdAt' | 'updatedAt'>

// Type for updating a room
export type UpdateRoomData = Partial<Omit<Room, 'id' | 'createdAt'>>

// Schema for form validation (without server-generated fields)
export const RoomFormSchema = RoomSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})