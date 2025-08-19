import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateReservationData } from '@/types/reservation'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        rooms: {
          include: {
            room: true
          }
        }
      }
    })
    
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Error fetching reservation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data: UpdateReservationData = await request.json()
    
    // Check for room availability if dates or rooms are being updated
    if (data.roomIds && data.checkInDate && data.checkOutDate) {
      const checkInDate = new Date(data.checkInDate)
      const checkOutDate = new Date(data.checkOutDate)
      
      // Find existing reservations that overlap with the requested dates
      // Exclude the current reservation being updated
      const conflictingReservations = await prisma.reservation.findMany({
        where: {
          id: {
            not: params.id // Exclude current reservation
          },
          rooms: {
            some: {
              roomId: {
                in: data.roomIds
              }
            }
          },
          AND: [
            {
              checkInDate: {
                lt: checkOutDate // Existing check-in is before new check-out
              }
            },
            {
              checkOutDate: {
                gt: checkInDate // Existing check-out is after new check-in
              }
            }
          ]
        },
        include: {
          rooms: {
            include: {
              room: true
            }
          }
        }
      })
      
      if (conflictingReservations.length > 0) {
         const conflictingRooms = conflictingReservations
           .flatMap(reservation => reservation.rooms)
           .filter(reservationRoom => data.roomIds!.includes(reservationRoom.roomId))
           .map(reservationRoom => reservationRoom.room?.name)
           .filter((name, index, array) => array.indexOf(name) === index) // Remove duplicates
        
        return NextResponse.json(
          { 
            error: `ห้องพักต่อไปนี้ถูกจองแล้วในช่วงเวลาที่เลือก: ${conflictingRooms.join(', ')}` 
          },
          { status: 409 }
        )
      }
    }
    
    // Handle room updates if roomIds are provided
    const updateData: any = {
      customerId: data.customerId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      totalAmount: data.totalAmount,
      extraBed: data.extraBed,
      notes: data.notes
    }
    
    if (data.roomIds) {
      // Delete existing room relationships and create new ones
      await prisma.reservationRoom.deleteMany({
        where: { reservationId: params.id }
      })
      
      updateData.rooms = {
        create: data.roomIds.map(roomId => ({
          roomId
        }))
      }
    }
    
    const reservation = await prisma.reservation.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        rooms: {
          include: {
            room: true
          }
        }
      }
    })
    
    return NextResponse.json(reservation)
  } catch (error: any) {
    console.error('Error updating reservation:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid customer or room ID' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.reservation.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting reservation:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete reservation' },
      { status: 500 }
    )
  }
}