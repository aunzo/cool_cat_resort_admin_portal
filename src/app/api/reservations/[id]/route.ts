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
        user: true,
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
    
    // Handle room updates if roomIds are provided
    const updateData: any = {
      userId: data.userId,
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
        user: true,
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
        { error: 'Invalid user or room ID' },
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