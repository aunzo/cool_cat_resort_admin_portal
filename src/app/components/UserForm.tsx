'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material'
import Button from '@/components/Button'
import { User, CreateUserSchema } from '@/types/user'
import { useUsers } from '@/hooks/useUsers'
import { z } from 'zod'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

type UserFormData = z.infer<typeof CreateUserSchema>
type UseUsersReturn = ReturnType<typeof useUsers>

interface UserFormProps {
  userHook?: UseUsersReturn
  user?: User | null
  onSuccess?: () => void
  onCancel?: () => void
}

const UserForm: React.FC<UserFormProps> = ({ userHook, user, onSuccess, onCancel }) => {
  const fallbackHook = useUsers()
  const { createUser, updateUser, error } = userHook || fallbackHook
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    name: '',
    role: 'admin'
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: '', // Don't populate password for editing
        name: user.name,
        role: user.role
      })
    }
  }, [user])

  const validateForm = () => {
    try {
      // For editing, password is optional
      const schema = user ? 
        CreateUserSchema.omit({ password: true }).extend({ password: z.string().optional() }) :
        CreateUserSchema
      
      schema.parse(formData)
      setFormErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0]] = err.message
          }
        })
        setFormErrors(errors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      if (user) {
        // Update user
        const updateData: any = {
          username: formData.username,
          name: formData.name,
          role: formData.role
        }
        
        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password
        }
        
        await updateUser(user.id, updateData)
      } else {
        // Create new user
        await createUser(formData)
      }
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        name: '',
        role: 'admin'
      })
      
      onSuccess?.()
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof UserFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {user ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="ชื่อผู้ใช้"
          value={formData.username}
          onChange={handleChange('username')}
          error={!!formErrors.username}
          helperText={formErrors.username}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label={user ? 'รหัสผ่านใหม่ (เว้นว่างหากไม่ต้องการเปลี่ยน)' : 'รหัสผ่าน'}
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange('password')}
          error={!!formErrors.password}
          helperText={formErrors.password}
          margin="normal"
          required={!user}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          fullWidth
          label="ชื่อ-นามสกุล"
          value={formData.name}
          onChange={handleChange('name')}
          error={!!formErrors.name}
          helperText={formErrors.name}
          margin="normal"
          required
        />
        
        <FormControl fullWidth margin="normal">
          <InputLabel>บทบาท</InputLabel>
          <Select
            value={formData.role}
            label="บทบาท"
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          >
            <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
            <MenuItem value="staff">พนักงาน</MenuItem>
            <MenuItem value="manager">ผู้จัดการ</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            sx={{ flex: 1 }}
          >
            {isSubmitting ? 'กำลังบันทึก...' : (user ? 'อัปเดตผู้ใช้' : 'เพิ่มผู้ใช้')}
          </Button>
          
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
            sx={{ flex: 1 }}
          >
            {user ? 'ยกเลิก' : 'ล้างข้อมูล'}
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default UserForm