import { User, CreateUserData, UpdateUserData } from '@/types/user'

export const userService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลลูกค้าได้')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching users:', error)
      throw new Error('ไม่สามารถดึงข้อมูลลูกค้าได้')
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await fetch(`/api/users/${id}`)
      if (response.status === 404) {
        return null
      }
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลลูกค้าได้')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching user:', error)
      throw new Error('ไม่สามารถดึงข้อมูลลูกค้าได้')
    }
  },

  // Create new user
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ไม่สามารถสร้างลูกค้าได้')
      }
      
      return await response.json()
    } catch (error: any) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  // Update user
  async updateUser(id: string, userData: Partial<CreateUserData>): Promise<User> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ไม่สามารถแก้ไขข้อมูลลูกค้าได้')
      }
      
      return await response.json()
    } catch (error: any) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ไม่สามารถลบลูกค้าได้')
      }
    } catch (error: any) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  // Search users by name or tax ID
  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await fetch(`/api/users?search=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('ไม่สามารถค้นหาลูกค้าได้')
      }
      return await response.json()
    } catch (error) {
      console.error('Error searching users:', error)
      throw new Error('ไม่สามารถค้นหาลูกค้าได้')
    }
  },
}

export default userService