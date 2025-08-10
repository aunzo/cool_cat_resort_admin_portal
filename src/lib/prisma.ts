import { PrismaClient } from '../../generated/prisma'

// Create a global variable to store the Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Use existing client or create new one
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// In development, store the client globally to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma