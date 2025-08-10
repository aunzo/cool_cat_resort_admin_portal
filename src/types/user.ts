export interface User {
  id?: string
  name: string
  address: string
  taxId: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateUserData {
  name: string
  address: string
  taxId: string
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: string
}