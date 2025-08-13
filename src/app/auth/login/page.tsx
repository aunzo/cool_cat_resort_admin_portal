'use client'
import React, { useState } from 'react'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material'
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              p: 4,
              textAlign: 'center',
              color: '#1a1a1a'
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
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)' }}>
              Cool Cat House
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#333333', textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)' }}>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 2,
                    color: '#1a1a1a',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused': {
                      background: 'rgba(255, 255, 255, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1a1a1a',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
                    '&.Mui-focused': {
                      color: '#1a1a1a',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#1a1a1a',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
                  },
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
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 2,
                    color: '#1a1a1a',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused': {
                      background: 'rgba(255, 255, 255, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#1a1a1a',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
                    '&.Mui-focused': {
                      color: '#1a1a1a',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#1a1a1a',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#1a1a1a',
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.35) 100%)',
                    backdropFilter: 'blur(25px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                    color: 'rgba(26, 26, 26, 0.5)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </Box>
                ) : (
                  'เข้าสู่ระบบจัดการ'
                )}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#333333', textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)' }}>
                การเข้าถึงผู้ดูแลระบบที่ปลอดภัย • ระบบจัดการ Cool Cat House
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}