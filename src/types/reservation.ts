import { z } from 'zod'

// Base Zod schema for reservation
const BaseReservationSchema = z.object({
  id: z.string().optional(),
  number: z.number().optional(),
  customerId: z.string().min(1, 'จำเป็นต้องระบุรหัสลูกค้า'),
  roomIds: z.array(z.string()).min(1, 'จำเป็นต้องเลือกห้องพักอย่างน้อยหนึ่งห้อง'),
  checkInDate: z.date(),
  checkOutDate: z.date(),
  totalAmount: z.number().min(0, 'จำนวนเงินรวมต้องเป็นค่าบวก'),
  extraBed: z.boolean().default(false),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

// Zod schema for reservation validation with date validation
export const ReservationSchema = BaseReservationSchema.refine(
  (data) => data.checkOutDate > data.checkInDate,
  {
    message: 'วันที่เช็คเอาท์ต้องหลังจากวันที่เช็คอิน',
    path: ['checkOutDate']
  }
)

// TypeScript type derived from Zod schema
export type Reservation = z.infer<typeof ReservationSchema>

// Type for creating a new reservation (without id, reservationNumber, createdAt, updatedAt)
export type CreateReservationData = Omit<Reservation, 'id' | 'reservationNumber' | 'createdAt' | 'updatedAt'>

// Type for updating a reservation
export type UpdateReservationData = Partial<Omit<Reservation, 'id' | 'createdAt'>>

// Schema for form validation (without server-generated fields)
export const ReservationFormSchema = BaseReservationSchema.omit({
  id: true,
  number: true,
  createdAt: true,
  updatedAt: true
}).refine(
  (data) => data.checkOutDate > data.checkInDate,
  {
    message: 'วันที่เช็คเอาท์ต้องหลังจากวันที่เช็คอิน',
    path: ['checkOutDate']
  }
)

// Extended type that includes user and room details for display
export interface ReservationWithDetails extends Reservation {
  customer?: {
    id: string
    name: string
    address: string
    taxId: string
  }
  rooms?: Array<{
    id: string
    reservationId: string
    roomId: string
    createdAt: string
    room?: {
      id: string
      name: string
      price: number
    }
  }>
}