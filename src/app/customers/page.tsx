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
  Paper,
} from '@mui/material'
import Button from '@/components/Button'
import {
  ExpandLess,
  ExpandMore,
  Add,
  ArrowBack,
} from '@mui/icons-material'
import AppLayout from '@/app/components/AppLayout'
import CustomerForm from '@/app/components/CustomerForm'
import CustomerDataTable from '@/app/components/CustomerDataTable'
import { useCustomers } from '@/hooks/useCustomers'
import Link from 'next/link'

export default function CustomersPage() {
  const [customerFormOpen, setCustomerFormOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const customerHook = useCustomers()

  return (
    <AppLayout title="Customer Management - Cool Cat Resort">
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
          จัดการลูกค้า
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
            onClick={() => setCustomerFormOpen(!customerFormOpen)}
            startIcon={<Add />}
            endIcon={customerFormOpen ? <ExpandLess /> : <ExpandMore />}
            sx={{ 
              p: 2,
              justifyContent: 'space-between',
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            เพิ่มลูกค้าใหม่
          </Button>
        </Paper>
        
        <Collapse in={customerFormOpen}>
          <Box mb={3}>
            <CustomerForm customerHook={customerHook} />
          </Box>
        </Collapse>
        
        <CustomerDataTable customerHook={customerHook} />
      </Box>
      
      {/* Desktop Layout */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Box sx={{ mb: 3 }}>
          <CustomerForm customerHook={customerHook} />
        </Box>
        
        <CustomerDataTable customerHook={customerHook} />
      </Box>
      </Container>
    </AppLayout>
  )
}