import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateRoomData } from '@/types/room'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const available = searchParams.get('available')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    
    if (search) {
      const rooms = await prisma.room.findMany({
        where: {
          name: { contains: search, mode: 'insensitive' }
        },
        orderBy: { name: 'asc' }
      })
      return NextResponse.json(rooms)
    }
    
    if (available === 'true' && checkIn && checkOut) {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      
      const rooms = await prisma.room.findMany({
        where: {
          reservationRooms: {
            none: {
              reservation: {
                OR: [
                  {
                    AND: [
                      { checkInDate: { lte: checkInDate } },
                      { checkOutDate: { gt: checkInDate } }
                    ]
                  },
                  {
                    AND: [
                      { checkInDate: { lt: checkOutDate } },
                      { checkOutDate: { gte: checkOutDate } }
                    ]
                  },
                  {
                    AND: [
                      { checkInDate: { gte: checkInDate } },
                      { checkOutDate: { lte: checkOutDate } }
                    ]
                  }
                ]
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      })
      return NextResponse.json(rooms)
    }
    
    const rooms = await prisma.room.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateRoomData = await request.json()
    
    const room = await prisma.room.create({
      data
    })
    
    return NextResponse.json(room, { status: 201 })
  } catch (error: any) {
    console.error('Error creating room:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A room with this number already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}