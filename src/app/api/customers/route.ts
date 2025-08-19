import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateCustomerData } from '@/types/customer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    if (search) {
      const customers = await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { taxId: { contains: search, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(customers)
    }
    
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateCustomerData = await request.json()
    
    const customer = await prisma.customer.create({
      data
    })
    
    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    console.error('Error creating customer:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}