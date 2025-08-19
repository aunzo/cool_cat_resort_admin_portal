import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateReservationData } from '@/types/reservation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const roomId = searchParams.get('roomId')
    const withDetails = searchParams.get('withDetails')
    
    if (customerId) {
      const reservations = await prisma.reservation.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(reservations)
    }
    
    if (roomId) {
      const reservations = await prisma.reservation.findMany({
        where: {
          rooms: {
            some: {
              roomId
            }
          }
        },
        include: {
          customer: true,
          rooms: {
            include: {
              room: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(reservations)
    }
    
    if (withDetails === 'true') {
      const reservations = await prisma.reservation.findMany({
        include: {
          customer: true,
          rooms: {
            include: {
              room: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(reservations)
    }
    
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateReservationData = await request.json()
    
    // Check for room availability (prevent double booking)
    const checkInDate = new Date(data.checkInDate)
    const checkOutDate = new Date(data.checkOutDate)
    
    // Find existing reservations that overlap with the requested dates
    const conflictingReservations = await prisma.reservation.findMany({
      where: {
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
        .filter(reservationRoom => data.roomIds.includes(reservationRoom.roomId))
        .map(reservationRoom => reservationRoom.room?.name)
        .filter((name, index, array) => array.indexOf(name) === index) // Remove duplicates
      
      return NextResponse.json(
        { 
          error: `ห้องพักต่อไปนี้ถูกจองแล้วในช่วงเวลาที่เลือก: ${conflictingRooms.join(', ')}` 
        },
        { status: 409 }
      )
    }
    
    // Get the next reservation number for the current year
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59)
    
    const lastReservationThisYear = await prisma.reservation.findFirst({
      where: {
        createdAt: {
          gte: startOfYear,
          lte: endOfYear
        }
      },
      orderBy: { number: 'desc' }
    })
    
    const nextNumber = lastReservationThisYear ? lastReservationThisYear.number + 1 : 1
    
    const reservation = await prisma.reservation.create({
      data: {
        customerId: data.customerId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        totalAmount: data.totalAmount,
        extraBed: data.extraBed,
        notes: data.notes,
        number: nextNumber,
        rooms: {
          create: data.roomIds.map(roomId => ({
            roomId
          }))
        }
      },
      include: {
        customer: true,
        rooms: {
          include: {
            room: true
          }
        }
      }
    })
    
    return NextResponse.json(reservation, { status: 201 })
  } catch (error: any) {
    console.error('Error creating reservation:', error)
    

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid customer or room ID' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}