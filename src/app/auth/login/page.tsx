'use client'
import React, { useState } from 'react'
import {
  Container,
  TextField,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material'
import Button from '@/components/Button'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LoginSchema, LoginFormData } from '@/types/user'
import { z } from 'zod'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import Image from 'next/image'

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Clear login error
    if (loginError) {
      setLoginError('')
    }
  }

  const validateForm = () => {
    try {
      LoginSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<LoginFormData> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginFormData] = err.message
          }
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setLoginError('')

    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false
      })
      
      if (result?.error) {
        setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
      } else {
        // Check if session was created successfully
        const session = await getSession()
        if (session) {
          router.push('/')
          router.refresh()
        } else {
          setLoginError('การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง')
        }
      }
    } catch (error) {
      setLoginError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Card 
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1995AD 0%, #A1D6E2 100%)',
              p: 4,
              textAlign: 'center',
              color: 'white'
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Image
                src="/assets/images/logos/logo-cchouse-2021.png"
                alt="Cool Cat House Logo"
                width={120}
                height={120}
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
              />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Cool Cat House
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              ยินดีต้อนรับ! กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {loginError && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: '1.2rem'
                  }
                }}
              >
                {loginError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="ชื่อผู้ใช้"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                margin="normal"
                required
                autoComplete="username"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="รหัสผ่าน"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                margin="normal"
                required
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                loading={isLoading}
                loadingText="กำลังเข้าสู่ระบบ..."
                sx={{ mt: 2, mb: 2 }}
              >
                เข้าสู่ระบบจัดการ
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                การเข้าถึงผู้ดูแลระบบที่ปลอดภัย • ระบบจัดการ Cool Cat House
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}