import { Reservation, CreateReservationData, UpdateReservationData, ReservationWithDetails } from '@/types/reservation'

export const reservationService = {
  // Get all reservations with details
  async getReservationsWithDetails(): Promise<ReservationWithDetails[]> {
    try {
      const response = await fetch('/api/reservations?withDetails=true')
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลการจองพร้อมรายละเอียดได้')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching reservations with details:', error)
      throw new Error('ไม่สามารถดึงข้อมูลการจองพร้อมรายละเอียดได้')
    }
  },

  // Get reservation by ID
  async getReservationById(id: string): Promise<ReservationWithDetails | null> {
    try {
      const response = await fetch(`/api/reservations/${id}`)
      if (response.status === 404) {
        return null
      }
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลการจองได้')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching reservation:', error)
      throw new Error('ไม่สามารถดึงข้อมูลการจองได้')
    }
  },

  // Create new reservation
  async createReservation(reservationData: CreateReservationData): Promise<Reservation> {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ไม่สามารถสร้างการจองได้')
      }
      
      return await response.json()
    } catch (error: any) {
      console.error('Error creating reservation:', error)
      throw error
    }
  },

  // Update reservation
  async updateReservation(id: string, reservationData: Partial<CreateReservationData>): Promise<Reservation> {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ไม่สามารถแก้ไขการจองได้')
      }
      
      return await response.json()
    } catch (error: any) {
      console.error('Error updating reservation:', error)
      throw error
    }
  },

  // Delete reservation
  async deleteReservation(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ไม่สามารถลบการจองได้')
      }
    } catch (error: any) {
      console.error('Error deleting reservation:', error)
      throw error
    }
  },

  // Get reservations by user ID
  async getUserReservations(userId: string): Promise<ReservationWithDetails[]> {
    try {
      const response = await fetch(`/api/reservations?userId=${encodeURIComponent(userId)}`)
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลการจองของลูกค้าได้')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching user reservations:', error)
      throw new Error('ไม่สามารถดึงข้อมูลการจองของลูกค้าได้')
    }
  },

  // Get reservations by room ID
  async getRoomReservations(roomId: string): Promise<ReservationWithDetails[]> {
    try {
      const response = await fetch(`/api/reservations?roomId=${encodeURIComponent(roomId)}`)
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลการจองของห้องพักได้')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching room reservations:', error)
      throw new Error('ไม่สามารถดึงข้อมูลการจองของห้องพักได้')
    }
  },
}

// Helper function to get the next reservation number
export const getNextReservationNumber = async (): Promise<number> => {
  try {
    const response = await fetch('/api/reservations/next-number')
    if (!response.ok) {
      throw new Error('ไม่สามารถสร้างหมายเลขการจองได้')
    }
    const data = await response.json()
    return data.nextNumber
  } catch (error) {
    console.error('Error getting next reservation number:', error)
    throw new Error('ไม่สามารถสร้างหมายเลขการจองได้')
  }
}

export default reservationService