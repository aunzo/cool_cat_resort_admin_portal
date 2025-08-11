'use client'
import React, { useState } from 'react'
import {
  Box,
  Container,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  Collapse,
  Button,
  Paper,
} from '@mui/material'
import {
  ExpandLess,
  ExpandMore,
  Add,
  ArrowBack,
} from '@mui/icons-material'
import AppLayout from '@/app/components/AppLayout'
import UserForm from '@/app/components/UserForm'
import UserDataTable from '@/app/components/UserDataTable'
import { useUsers } from '@/hooks/useUsers'
import Link from 'next/link'

export default function UsersPage() {
  const [userFormOpen, setUserFormOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const userHook = useUsers()

  return (
    <AppLayout title="User Management - Cool Cat Resort">
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 3, sm: 4 } }}>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            textAlign: { xs: 'center', sm: 'left' },
            flex: 1
          }}
        >
          จัดการผู้ใช้
        </Typography>
        <Button
            component={Link}
            href="/"
            variant="outlined"
            startIcon={<ArrowBack />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            กลับหน้าหลัก
          </Button>
      </Box>
      
      {/* Mobile Layout */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Paper elevation={1} sx={{ mb: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setUserFormOpen(!userFormOpen)}
            startIcon={<Add />}
            endIcon={userFormOpen ? <ExpandLess /> : <ExpandMore />}
            sx={{ 
              p: 2,
              justifyContent: 'space-between',
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            เพิ่มผู้ใช้ใหม่
          </Button>
        </Paper>
        
        <Collapse in={userFormOpen}>
          <Box mb={3}>
            <UserForm userHook={userHook} />
          </Box>
        </Collapse>
        
        <UserDataTable userHook={userHook} />
      </Box>
      
      {/* Desktop Layout */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Box sx={{ mb: 3 }}>
          <UserForm userHook={userHook} />
        </Box>
        
        <UserDataTable userHook={userHook} />
      </Box>
      </Container>
    </AppLayout>
  )
}