import { useState, useEffect } from 'react'
import { Reservation, CreateReservationData, UpdateReservationData, ReservationWithDetails } from '@/types/reservation'
import { reservationService } from '@/services/reservationService'

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [reservationsWithDetails, setReservationsWithDetails] = useState<ReservationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedReservations = await reservationService.getReservationsWithDetails()
      setReservations(fetchedReservations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลการจองได้')
    } finally {
      setLoading(false)
    }
  }

  const fetchReservationsWithDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedReservations = await reservationService.getReservationsWithDetails()
      setReservationsWithDetails(fetchedReservations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลการจองพร้อมรายละเอียดได้')
    } finally {
      setLoading(false)
    }
  }

  const createNewReservation = async (reservationData: CreateReservationData) => {
    try {
      setError(null)
      await reservationService.createReservation(reservationData)
      await fetchReservations() // Refresh the list
      await fetchReservationsWithDetails() // Refresh detailed list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถสร้างการจองได้')
      throw err
    }
  }

  const updateExistingReservation = async (id: string, reservationData: UpdateReservationData) => {
    try {
      setError(null)
      await reservationService.updateReservation(id, reservationData)
      await fetchReservations() // Refresh the list
      await fetchReservationsWithDetails() // Refresh detailed list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถอัปเดตการจองได้')
      throw err
    }
  }

  const deleteExistingReservation = async (id: string) => {
    try {
      setError(null)
      await reservationService.deleteReservation(id)
      await fetchReservations() // Refresh the list
      await fetchReservationsWithDetails() // Refresh detailed list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถลบการจองได้')
      throw err
    }
  }

  const fetchReservationsByUser = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      const userReservations = await reservationService.getUserReservations(userId)
      return userReservations
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลการจองของลูกค้าได้')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchReservationsByRoom = async (roomId: string) => {
    try {
      setLoading(true)
      setError(null)
      const roomReservations = await reservationService.getRoomReservations(roomId)
      return roomReservations
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลการจองของห้องพักได้')
      throw err
    } finally {
      setLoading(false)
    }
  }



  useEffect(() => {
    fetchReservations()
    fetchReservationsWithDetails()
  }, [])

  return {
    reservations,
    reservationsWithDetails,
    loading,
    error,
    fetchReservations,
    fetchReservationsWithDetails,
    createReservation: createNewReservation,
    updateReservation: updateExistingReservation,
    deleteReservation: deleteExistingReservation,
    fetchReservationsByUser,
    fetchReservationsByRoom
  }
}