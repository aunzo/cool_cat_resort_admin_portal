'use client'
import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material'
import { useRooms } from '@/hooks/useRooms'
import { RoomFormSchema, CreateRoomData, Room } from '@/types/room'
import { z } from 'zod'

type RoomFormData = z.infer<typeof RoomFormSchema>
type UseRoomsReturn = ReturnType<typeof useRooms>

interface RoomFormProps {
  roomHook?: UseRoomsReturn
  editingRoom?: Room
  onEditComplete?: () => void
}

export default function RoomForm({ roomHook, editingRoom, onEditComplete }: RoomFormProps) {
  const [formData, setFormData] = useState<Partial<RoomFormData>>({
    name: editingRoom?.name || '',
    price: editingRoom?.price || 0,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof RoomFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const fallbackHook = useRooms()
  const { addRoom, editRoom } = roomHook || fallbackHook
  const isEditing = !!editingRoom

  const handleChange = (field: keyof RoomFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'price' ? parseFloat(event.target.value) || 0 : event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCancel = () => {
    if (editingRoom && onEditComplete) {
      onEditComplete()
    } else {
      setFormData({
        name: '',
        price: 0,
      })
    }
    setSubmitError(null)
  }

  const validateForm = (): boolean => {
    try {
      RoomFormSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof RoomFormData, string>> = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            const field = err.path[0] as keyof RoomFormData
            newErrors[field] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitSuccess(false)
    setSubmitError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditing && editingRoom) {
        const updateData = {
          name: formData.name!,
          price: formData.price!,
        }

        const success = await editRoom(editingRoom.id!, updateData)

        if (success) {
          setSubmitSuccess(true)
          onEditComplete?.()

          // Clear success message after 3 seconds
          setTimeout(() => setSubmitSuccess(false), 3000)
        } else {
          setSubmitError('ไม่สามารถอัปเดตห้องพักได้ กรุณาลองใหม่อีกครั้ง')
        }
      } else {
        const roomData: CreateRoomData = {
          name: formData.name!,
          price: formData.price!,
        }

        const result = await addRoom(roomData)

        if (result) {
          setSubmitSuccess(true)
          setFormData({ name: '', price: 0 })
          setErrors({})

          // Clear success message after 3 seconds
          setTimeout(() => setSubmitSuccess(false), 3000)
        } else {
          setSubmitError('ไม่สามารถสร้างห้องพักได้ กรุณาลองใหม่อีกครั้ง')
        }
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'แก้ไขห้องพัก' : 'เพิ่มห้องพักใหม่'}
      </Typography>

      {submitSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSubmitSuccess(false)}
        >
          {isEditing ? 'อัปเดตห้องพักสำเร็จ!' : 'สร้างห้องพักสำเร็จ!'}
        </Alert>
      )}

      {submitError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setSubmitError(null)}
        >
          {submitError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="ชื่อห้องพัก"
          value={formData.name}
          onChange={handleChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          size={isMobile ? "small" : "medium"}
          required
        />

        <TextField
          fullWidth
          label="ราคาต่อคืน (฿)"
          type="number"
          value={formData.price}
          onChange={handleChange('price')}
          error={!!errors.price}
          helperText={errors.price}
          size={isMobile ? "small" : "medium"}
          inputProps={{ min: 0, step: 0.01 }}
          required
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ flex: 1 }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} color="inherit" />
                {isEditing ? 'กำลังอัปเดต...' : 'กำลังสร้าง...'}
              </>
            ) : (
              isEditing ? 'อัปเดตห้องพัก' : 'สร้างห้องพัก'
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