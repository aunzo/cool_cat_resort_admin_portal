import { useState, useEffect, useCallback } from 'react'
import { roomService } from '@/services/roomService'
import { Room, CreateRoomData, UpdateRoomData } from '@/types/room'

interface UseRoomsReturn {
  rooms: Room[]
  loading: boolean
  error: string | null
  refreshRooms: () => Promise<void>
  addRoom: (data: CreateRoomData) => Promise<string | null>
  editRoom: (id: string, data: UpdateRoomData) => Promise<boolean>
  removeRoom: (id: string) => Promise<boolean>
  searchRoomsByTerm: (searchTerm: string) => Promise<void>
  clearSearch: () => void
}

export const useRooms = (): UseRoomsReturn => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Fetch all rooms
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await roomService.getRooms()
      setRooms(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms')
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh rooms
  const refreshRooms = useCallback(async () => {
    if (!isSearching) {
      await fetchRooms()
    }
  }, [fetchRooms, isSearching])

  // Add new room
  const addRoom = useCallback(async (data: CreateRoomData): Promise<string | null> => {
    try {
      setError(null)
      const room = await roomService.createRoom(data)
       const id = room.id || null
      await refreshRooms()
      return id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room')
      return null
    }
  }, [refreshRooms])

  // Update room
  const editRoom = useCallback(async (id: string, data: UpdateRoomData): Promise<boolean> => {
    try {
      setError(null)
      await roomService.updateRoom(id, data)
      await refreshRooms()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update room')
      return false
    }
  }, [refreshRooms])

  // Delete room
  const removeRoom = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null)
      await roomService.deleteRoom(id)
      await refreshRooms()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete room')
      return false
    }
  }, [refreshRooms])

  // Search rooms
  const searchRoomsByTerm = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setIsSearching(false)
      await fetchRooms()
      return
    }

    try {
      setLoading(true)
      setError(null)
      setIsSearching(true)
      const results = await roomService.searchRooms(searchTerm)
      setRooms(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search rooms')
    } finally {
      setLoading(false)
    }
  }, [fetchRooms])

  // Clear search and return to all rooms
  const clearSearch = useCallback(() => {
    setIsSearching(false)
    fetchRooms()
  }, [fetchRooms])

  // Initial load
  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return {
    rooms,
    loading,
    error,
    refreshRooms,
    addRoom,
    editRoom,
    removeRoom,
    searchRoomsByTerm,
    clearSearch
  }
}