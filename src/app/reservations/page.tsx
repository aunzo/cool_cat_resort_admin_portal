'use client'
import React from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import Link from 'next/link'
import { ArrowBack } from '@mui/icons-material'
import AppLayout from '@/app/components/AppLayout'
import ReservationForm from '@/app/components/ReservationForm'
import ReservationDataTable from '@/app/components/ReservationDataTable'
import { useReservations } from '@/hooks/useReservations'

export default function ReservationsPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const reservationHook = useReservations()

  return (
    <AppLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              textAlign: isMobile ? 'center' : 'left',
              flex: 1
            }}
          >
            จัดการการจอง
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
        
        {isMobile ? (
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <ReservationForm reservationHook={reservationHook} />
          </Paper>
        ) : (
          <ReservationForm reservationHook={reservationHook} />
        )}
        
        <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              textAlign: 'center',
              mb: 3
            }}
          >
          </Typography>
          <ReservationDataTable reservationHook={reservationHook} />
      </Container>
    </AppLayout>
  )
}