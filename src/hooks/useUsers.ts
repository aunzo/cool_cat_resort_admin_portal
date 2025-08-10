import { useState, useEffect } from 'react'
import { User, CreateUserData, UpdateUserData } from '@/types/user'
import { userService } from '@/services/userService'

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedUsers = await userService.getUsers()
      setUsers(fetchedUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: CreateUserData) => {
    try {
      setError(null)
      await userService.createUser(userData)
      await fetchUsers() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
      throw err
    }
  }

  const updateUser = async (userData: UpdateUserData) => {
    try {
      setError(null)
      await userService.updateUser(userData.id, userData)
      await fetchUsers() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
      throw err
    }
  }

  const deleteUser = async (id: string) => {
    try {
      setError(null)
      await userService.deleteUser(id)
      await fetchUsers() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
      throw err
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers: fetchUsers,
  }
}