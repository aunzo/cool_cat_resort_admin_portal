'use client'
import React from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Paper,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  AttachMoney,
  EventAvailable,
  Group,
  Hotel,
  Person,
  CalendarToday,
} from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay'
import Link from 'next/link'
import AppLayout from '@/app/components/AppLayout'
import { useReservations } from '@/hooks/useReservations'
import { useRooms } from '@/hooks/useRooms'
import { useUsers } from '@/hooks/useUsers'
import { ReservationWithDetails } from '@/types/reservation'
import { isSameDay, parseISO } from 'date-fns'

export default function HomePage() {
  const { reservationsWithDetails, loading: reservationsLoading } = useReservations()
  const { rooms, loading: roomsLoading } = useRooms()
  const { users, loading: usersLoading } = useUsers()
  
  // Modal state for calendar reservations
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [selectedDateReservations, setSelectedDateReservations] = React.useState<ReservationWithDetails[]>([])

  // Calculate dashboard metrics
  const totalReservations = reservationsWithDetails.length
  const totalRevenue = reservationsWithDetails.reduce((sum, reservation) => sum + (reservation.totalAmount || 0), 0)
  const recentReservations = reservationsWithDetails
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5)
  const totalRooms = rooms.length
  const totalUsers = users.length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Handle calendar day click
  const handleDayClick = (date: Date) => {
    const reservationsForDay = getReservationsForDate(date)
    if (reservationsForDay.length > 0) {
      setSelectedDate(date)
      setSelectedDateReservations(reservationsForDay)
      setModalOpen(true)
    }
  }
  
  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedDate(null)
    setSelectedDateReservations([])
  }

  // Get reservations for a specific date
  const getReservationsForDate = (date: Date) => {
    return reservationsWithDetails.filter(reservationsWithDetails => {
      const checkIn = reservationsWithDetails.checkInDate
      const checkOut = reservationsWithDetails.checkOutDate
      if (!checkIn || !checkOut) return false
      
      const checkInDate = checkIn instanceof Date ? checkIn : new Date(checkIn)
      const checkOutDate = checkOut instanceof Date ? checkOut : new Date(checkOut)
      
      return date >= checkInDate && date <= checkOutDate
    })
  }

  // Custom day component for calendar
  const CustomDay = (props: PickersDayProps) => {
    const { day, outsideCurrentMonth, ...other } = props
    const reservationsForDay = getReservationsForDate(day)
    const hasReservations = reservationsForDay.length > 0

    if (outsideCurrentMonth) {
      return <PickersDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} />
    }

    return (
      <Tooltip
        title={
          hasReservations
            ? `${reservationsForDay.length} การจอง - คลิกเพื่อดูรายละเอียด`
            : 'ไม่มีการจอง'
        }
        arrow
      >
        <Badge
          badgeContent={hasReservations ? reservationsForDay.length : 0}
          color="primary"
          overlap="circular"
        >
          <PickersDay
            {...other}
            day={day}
            outsideCurrentMonth={outsideCurrentMonth}
            onClick={() => handleDayClick(day)}
            sx={{
              ...(hasReservations && {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'primary.main',
                },
              }),
            }}
          />
        </Badge>
      </Tooltip>
    )
  }

  return (
    <AppLayout title="Cool Cat Resort - ระบบจัดการ">
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              mb: 2
            }}
          >
ยินดีต้อนรับสู่ Cool Cat Resort
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary"
            sx={{ mb: 4 }}
          >
ระบบจัดการสำนักงาน
          </Typography>
        </Box>

        {/* Dashboard Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
            แดชบอร์ด
          </Typography>
          
          {/* Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EventAvailable sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {reservationsLoading ? <CircularProgress size={24} color="inherit" /> : totalReservations}
                  </Typography>
                  <Typography variant="body1">การจองทั้งหมด</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AttachMoney sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {reservationsLoading ? <CircularProgress size={24} color="inherit" /> : formatCurrency(totalRevenue)}
                  </Typography>
                  <Typography variant="body1">รายได้รวม</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Hotel sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {roomsLoading ? <CircularProgress size={24} color="inherit" /> : totalRooms}
                  </Typography>
                  <Typography variant="body1">ห้องพักทั้งหมด</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Group sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {usersLoading ? <CircularProgress size={24} color="inherit" /> : totalUsers}
                  </Typography>
                  <Typography variant="body1">ลูกค้าทั้งหมด</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Calendar View */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: 400, overflow: 'auto' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
                  ปฏิทินการจอง
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateCalendar
                    showDaysOutsideCurrentMonth
                    slots={{
                      day: CustomDay,
                    }}
                    sx={{
                      width: '100%',
                      '& .MuiPickersCalendarHeader-root': {
                        paddingLeft: 1,
                        paddingRight: 1,
                      },
                      '& .MuiDayCalendar-root': {
                        minHeight: 'auto',
                      },
                      '& .MuiPickersDay-root': {
                        fontSize: '0.9rem',
                        width: 36,
                        height: 36,
                        margin: '2px',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 3, height: 400, overflow: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    การจองล่าสุด
                  </Typography>
                  <Button component={Link} href="/reservations" variant="outlined" size="small">
                    ดูทั้งหมด
                  </Button>
                </Box>
                
                {reservationsLoading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2 }}>กำลังโหลดการจอง...</Typography>
                  </Box>
                ) : recentReservations.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">ยังไม่มีการจอง</Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    <Grid container spacing={2}>
                      {recentReservations.map((reservation) => (
                        <Grid item xs={12} key={reservation.id}>
                          <Card variant="outlined" sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                              <Box>
                                <Typography variant="h6" color="text.secondary">
                                   ผู้จอง: {(reservation as ReservationWithDetails).user?.name || 'ลูกค้าที่ถูกลบ'}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                   ห้อง: {(reservation as ReservationWithDetails).rooms?.map(room => room.room?.name).join(', ') || 'ไม่มีข้อมูลห้อง'}
                                 </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                                  {formatCurrency(reservation.totalAmount || 0)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {reservation.checkInDate && formatDate(reservation.checkInDate)} - {reservation.checkOutDate && formatDate(reservation.checkOutDate)}
                                </Typography>
                                <Chip 
                                  label={reservation.createdAt ? formatDate(reservation.createdAt) : 'ไม่ทราบวันที่'} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                  sx={{ mt: 1 }}
                                />
                              </Box>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        {/* Management Section */}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3, textAlign: 'center' }}>
          ระบบจัดการ
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Hotel sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                จัดการห้องพัก
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                จัดการห้องพักโรงแรม ความพร้อม และราคา
              </Typography>
              <Button 
                component={Link} 
                href="/rooms" 
                variant="contained" 
                size="large"
                fullWidth
              >
จัดการห้องพัก
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Person sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                จัดการลูกค้า
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                จัดการบัญชีลูกค้าและข้อมูลลูกค้า
              </Typography>
              <Button 
                component={Link} 
                href="/users" 
                variant="contained" 
                size="large"
                fullWidth
              >
จัดการลูกค้า
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CalendarToday sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                จัดการการจอง
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                จัดการการจอง เช็คอิน และการจองของแขก
              </Typography>
              <Button 
                component={Link} 
                href="/reservations" 
                variant="contained" 
                size="large"
                fullWidth
              >
จัดการการจอง
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Reservation Details Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          การจองวันที่ {selectedDate && formatDate(selectedDate)}
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedDateReservations.map((reservation, index) => (
              <React.Fragment key={reservation.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <React.Fragment>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                          การจอง #{reservation.number}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                          ผู้จอง: {reservation.user?.name || 'ลูกค้าที่ถูกลบ'}
                        </div>
                      </React.Fragment>
                    }
                    secondary={
                      <React.Fragment>
                        <div style={{ marginTop: 8 }}>
                          ห้องพัก: {reservation.rooms?.map(room => room.room?.name).join(', ') || 'ไม่มีข้อมูลห้อง'}
                        </div>
                        <div>
                          ระยะเวลา: {reservation.checkInDate && formatDate(reservation.checkInDate)} - {reservation.checkOutDate && formatDate(reservation.checkOutDate)}
                        </div>
                        <div style={{ fontWeight: 600, color: '#1976d2' }}>
                          ยอดรวม: {formatCurrency(reservation.totalAmount || 0)}
                        </div>
                        {reservation.notes && (
                          <div style={{ marginTop: 8, fontStyle: 'italic' }}>
                            หมายเหตุ: {reservation.notes}
                          </div>
                        )}
                      </React.Fragment>
                    }
                  />
                </ListItem>
                {index < selectedDateReservations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="primary">
            ปิด
          </Button>
          <Button 
            component={Link} 
            href="/reservations" 
            variant="contained" 
            color="primary"
            onClick={handleModalClose}
          >
            ดูการจองทั้งหมด
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  )
}