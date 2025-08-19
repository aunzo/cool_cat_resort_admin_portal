'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import Button from '@/components/Button'
import { Customer, CustomerFormSchema } from '@/types/customer'
import { useCustomers } from '@/hooks/useCustomers'
import { z } from 'zod'

type CustomerFormData = z.infer<typeof CustomerFormSchema>

interface CustomerFormProps {
  customerHook: ReturnType<typeof useCustomers>
  editingCustomer?: Customer | null
  onEditComplete?: () => void
}

export default function CustomerForm({ customerHook, editingCustomer, onEditComplete }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    address: '',
    taxId: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({})

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name,
        address: editingCustomer.address,
        taxId: editingCustomer.taxId,
      })
    } else {
      setFormData({
        name: '',
        address: '',
        taxId: '',
      })
    }
  }, [editingCustomer])

  const handleInputChange = (field: keyof CustomerFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }))
    setFormError(null)
    // Clear field-specific error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    try {
      CustomerFormSchema.parse(formData)
      setFieldErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof CustomerFormData, string>> = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            const field = err.path[0] as keyof CustomerFormData
            errors[field] = err.message
          }
        })
        setFieldErrors(errors)
      }
      return false
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) {
      setFormError('กรุณาแก้ไขข้อผิดพลาดในแบบฟอร์ม')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      if (editingCustomer) {
        await customerHook.updateCustomer({
          id: editingCustomer.id!,
          ...formData,
        })
        onEditComplete?.()
      } else {
        await customerHook.createCustomer(formData)
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
    if (editingCustomer && onEditComplete) {
      onEditComplete()
    } else {
      setFormData({
        name: '',
        address: '',
        taxId: '',
      })
    }
    setFormError(null)
    setFieldErrors({})
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {editingCustomer ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้าใหม่'}
      </Typography>
      
      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="ชื่อ"
          value={formData.name}
          onChange={handleInputChange('name')}
          required
          fullWidth
          disabled={isSubmitting}
          error={!!fieldErrors.name}
          helperText={fieldErrors.name}
          margin="normal"
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
          error={!!fieldErrors.address}
          helperText={fieldErrors.address}
          margin="normal"
        />
        
        <TextField
          label="เลขประจำตัวผู้เสียภาษี"
          value={formData.taxId}
          onChange={handleInputChange('taxId')}
          required
          fullWidth
          disabled={isSubmitting}
          error={!!fieldErrors.taxId}
          helperText={fieldErrors.taxId}
          margin="normal"
        />
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            sx={{ flex: 1 }}
          >
            {isSubmitting ? 'กำลังบันทึก...' : (editingCustomer ? 'อัปเดตลูกค้า' : 'เพิ่มลูกค้า')}
          </Button>
          
          <Button
            type="button"
            variant="outlined"
            onClick={handleCancel}
            disabled={isSubmitting}
            sx={{ flex: 1 }}
          >
            {editingCustomer ? 'ยกเลิก' : 'ล้างข้อมูล'}
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}