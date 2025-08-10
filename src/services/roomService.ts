import { Room, CreateRoomData, UpdateRoomData } from '@/types/room'

export const roomService = {
  // Get all rooms
  async getRooms(): Promise<Room[]> {
    try {
      const response = await fetch('/api/rooms')
      if (!response.ok) {
        throw new Error('Failed to fetch rooms')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching rooms:', error)
      throw new Error('ไม่สามารถดึงข้อมูลห้องพักได้')
    }
  },

  // Get room by ID
  async getRoomById(id: string): Promise<Room | null> {
    try {
      const response = await fetch(`/api/rooms/${id}`)
      if (response.status === 404) {
        return null
      }
      if (!response.ok) {
        throw new Error('Failed to fetch room')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching room:', error)
      throw new Error('ไม่สามารถดึงข้อมูลห้องพักได้')
    }
  },

  // Create new room
  async createRoom(roomData: CreateRoomData): Promise<Room> {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ไม่สามารถสร้างห้องพักได้')
      }
      
      return await response.json()
    } catch (error: any) {
      console.error('Error creating room:', error)
      throw error
    }
  },

  // Update room
  async updateRoom(id: string, roomData: Partial<CreateRoomData>): Promise<Room> {
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ไม่สามารถแก้ไขข้อมูลห้องพักได้')
      }
      
      return await response.json()
    } catch (error: any) {
      console.error('Error updating room:', error)
      throw error
    }
  },

  // Delete room
  async deleteRoom(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ไม่สามารถลบห้องพักได้')
      }
    } catch (error: any) {
      console.error('Error deleting room:', error)
      throw error
    }
  },

  // Search rooms by name
  async searchRooms(query: string): Promise<Room[]> {
    try {
      const response = await fetch(`/api/rooms?search=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Failed to search rooms')
      }
      return await response.json()
    } catch (error) {
      console.error('Error searching rooms:', error)
      throw new Error('ไม่สามารถค้นหาห้องพักได้')
    }
  },

  // Get available rooms for a date range
  async getAvailableRooms(checkInDate: Date, checkOutDate: Date): Promise<Room[]> {
    try {
      const checkInStr = checkInDate.toISOString()
      const checkOutStr = checkOutDate.toISOString()
      const response = await fetch(`/api/rooms?available=true&checkIn=${encodeURIComponent(checkInStr)}&checkOut=${encodeURIComponent(checkOutStr)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch available rooms')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching available rooms:', error)
      throw new Error('ไม่สามารถดึงข้อมูลห้องพักที่ว่างได้')
    }
  },
}

export default roomService