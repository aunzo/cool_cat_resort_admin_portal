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

const UsersPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false)
  const { users, loading } = useUsers()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleFormSuccess = () => {
    setShowForm(false)
  }

  return (
    <AppLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Link href="/" passHref>
              <Button
                startIcon={<ArrowBack />}
                sx={{ mr: 2 }}
                color="inherit"
              >
                กลับหน้าหลัก
              </Button>
            </Link>
            <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
              จัดการผู้ใช้
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowForm(!showForm)}
              sx={{ ml: 2 }}
            >
              เพิ่มผู้ใช้
            </Button>
          </Box>
          
          <Typography variant="body1" color="text.secondary">
            จัดการข้อมูลผู้ใช้ระบบ เพิ่ม แก้ไข และลบผู้ใช้
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Add User Form */}
          <Grid item xs={12}>
            <Collapse in={showForm}>
              <Box sx={{ mb: 3 }}>
                <UserForm
                  onSuccess={handleFormSuccess}
                  onCancel={() => setShowForm(false)}
                />
              </Box>
            </Collapse>
          </Grid>

          {/* Users Table */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  รายการผู้ใช้ ({loading ? '...' : users.length} คน)
                </Typography>
                {!isMobile && (
                  <Button
                    variant="outlined"
                    startIcon={showForm ? <ExpandLess /> : <ExpandMore />}
                    onClick={() => setShowForm(!showForm)}
                  >
                    {showForm ? 'ซ่อนฟอร์ม' : 'แสดงฟอร์มเพิ่มผู้ใช้'}
                  </Button>
                )}
              </Box>
              
              <UserDataTable />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </AppLayout>
  )
}

export default UsersPage