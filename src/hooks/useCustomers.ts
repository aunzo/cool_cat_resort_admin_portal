import { useState, useEffect } from 'react'
import { Customer, CreateCustomerData, UpdateCustomerData } from '@/types/customer'
import { customerService } from '@/services/customerService'

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedCustomers = await customerService.getCustomers()
      setCustomers(fetchedCustomers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async (customerData: CreateCustomerData) => {
    try {
      setError(null)
      await customerService.createCustomer(customerData)
      await fetchCustomers() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer')
      throw err
    }
  }

  const updateCustomer = async (customerData: UpdateCustomerData) => {
    try {
      setError(null)
      await customerService.updateCustomer(customerData.id, customerData)
      await fetchCustomers() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer')
      throw err
    }
  }

  const deleteCustomer = async (id: string) => {
    try {
      setError(null)
      await customerService.deleteCustomer(id)
      await fetchCustomers() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer')
      throw err
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers: fetchCustomers,
  }
}