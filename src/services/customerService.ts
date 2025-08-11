import { Customer, CreateCustomerData, UpdateCustomerData } from '@/types/customer'

export const customerService = {
  // Get all customers
  async getCustomers(): Promise<Customer[]> {
    try {
      const response = await fetch('/api/customers')
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลลูกค้าได้')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching customers:', error)
      throw new Error('ไม่สามารถดึงข้อมูลลูกค้าได้')
    }
  },

  // Get customer by ID
  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const response = await fetch(`/api/customers/${id}`)
      if (response.status === 404) {
        return null
      }
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลลูกค้าได้')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching customer:', error)
      throw new Error('ไม่สามารถดึงข้อมูลลูกค้าได้')
    }
  },

  // Create customer
  async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ไม่สามารถสร้างลูกค้าได้')
      }
      
      return await response.json()
    } catch (error: any) {
      console.error('Error creating customer:', error)
      throw error
    }
  },

  // Update customer
  async updateCustomer(id: string, customerData: Partial<CreateCustomerData>): Promise<Customer> {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ไม่สามารถแก้ไขข้อมูลลูกค้าได้')
      }
      
      return await response.json()
    } catch (error: any) {
      console.error('Error updating customer:', error)
      throw error
    }
  },

  // Delete customer
  async deleteCustomer(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'ไม่สามารถลบลูกค้าได้')
      }
    } catch (error: any) {
      console.error('Error deleting customer:', error)
      throw error
    }
  },

  // Search customers by name or tax ID
  async searchCustomers(query: string): Promise<Customer[]> {
    try {
      const response = await fetch(`/api/customers?search=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('ไม่สามารถค้นหาลูกค้าได้')
      }
      return await response.json()
    } catch (error) {
      console.error('Error searching customers:', error)
      throw new Error('ไม่สามารถค้นหาลูกค้าได้')
    }
  },
}

export default customerService