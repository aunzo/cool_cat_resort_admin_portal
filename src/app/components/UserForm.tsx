'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { User, CreateUserData } from '@/types/user'
import { useUsers } from '@/hooks/useUsers'

interface UserFormProps {
  userHook: ReturnType<typeof useUsers>
  editingUser?: User | null
  onEditComplete?: () => void
}

export default function UserForm({ userHook, editingUser, onEditComplete }: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    address: '',
    taxId: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        address: editingUser.address,
        taxId: editingUser.taxId,
      })
    } else {
      setFormData({
        name: '',
        address: '',
        taxId: '',
      })
    }
  }, [editingUser])

  const handleInputChange = (field: keyof CreateUserData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }))
    setFormError(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!formData.name.trim() || !formData.address.trim() || !formData.taxId.trim()) {
      setFormError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      if (editingUser) {
        await userHook.updateUser({
          id: editingUser.id!,
          ...formData,
        })
        onEditComplete?.()
      } else {
        await userHook.createUser(formData)
        setFormData({
          name: '',
          address: '',
          taxId: '',
        })
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (editingUser && onEditComplete) {
      onEditComplete()
    } else {
      setFormData({
        name: '',
        address: '',
        taxId: '',
      })
    }
    setFormError(null)
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {editingUser ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้าใหม่'}
      </Typography>
      
      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}
      
      {userHook.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {userHook.error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="ชื่อ"
          value={formData.name}
          onChange={handleInputChange('name')}
          required
          fullWidth
          disabled={isSubmitting}
        />
        
        <TextField
          label="ที่อยู่"
          value={formData.address}
          onChange={handleInputChange('address')}
          required
          fullWidth
          multiline
          rows={3}
          disabled={isSubmitting}
        />
        
        <TextField
          label="เลขประจำตัวผู้เสียภาษี"
          value={formData.taxId}
          onChange={handleInputChange('taxId')}
          required
          fullWidth
          disabled={isSubmitting}
        />
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ flex: 1 }}
          >
            {isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              editingUser ? 'อัปเดตลูกค้า' : 'เพิ่มลูกค้า'
            )}
          </Button>
          
          <Button
            type="button"
            variant="outlined"
            onClick={handleCancel}
            disabled={isSubmitting}
            sx={{ flex: 1 }}
          >
ยกเลิก
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}