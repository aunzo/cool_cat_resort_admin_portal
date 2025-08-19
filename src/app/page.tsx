'use client'
import React from 'react'
import {
  Container,
  Typography,
  Box,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import Button from '@/components/Button'
import {
  AttachMoney,
  EventAvailable,
  Group,
  Hotel,
  Person,
  CalendarToday,
  AdminPanelSettings,
} from '@mui/icons-material'
import { Calendar, dateFnsLocalizer, Event, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { th } from 'date-fns/locale'
import Link from 'next/link'
import AppLayout from '@/app/components/AppLayout'
import { useReservations } from '@/hooks/useReservations'
import { useRooms } from '@/hooks/useRooms'
import { useCustomers } from '@/hooks/useCustomers'
import { ReservationWithDetails } from '@/types/reservation'
import { isSameDay, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

// Setup the localizer for react-big-calendar
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'th': th,
  },
})

export default function HomePage() {
  const { reservationsWithDetails, loading: reservationsLoading } = useReservations()
  const { rooms, loading: roomsLoading } = useRooms()
  const { customers, loading: customersLoading } = useCustomers()
  
  // Modal state for calendar reservations
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [selectedDateReservations, setSelectedDateReservations] = React.useState<ReservationWithDetails[]>([])
  const [calendarView, setCalendarView] = React.useState<View>('month')
  
  // Chart filter state
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear())

  // Calculate dashboard metrics
  const totalReservations = reservationsWithDetails.length
  const totalRevenue = reservationsWithDetails.reduce((sum, reservation) => sum + (reservation.totalAmount || 0), 0)
  const recentReservations = reservationsWithDetails
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5)
  const totalRooms = rooms.length
  const totalCustomers = customers.length

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

  // Prepare chart data for the selected year
  const getChartData = () => {
    const months = eachMonthOfInterval({
      start: new Date(selectedYear, 0, 1), // January 1st of selected year
      end: new Date(selectedYear, 11, 31)  // December 31st of selected year
    })

    return months.map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const monthReservations = reservationsWithDetails.filter(reservation => {
        const createdDate = new Date(reservation.createdAt || '')
        return createdDate >= monthStart && createdDate <= monthEnd
      })

      const monthRevenue = monthReservations.reduce((sum, reservation) => sum + (reservation.totalAmount || 0), 0)

      return {
        month: format(month, 'MMM', { locale: undefined }),
        reservations: monthReservations.length,
        revenue: monthRevenue
      }
    })
  }

  const chartData = getChartData()
  
  // Get available years from reservations
  const getAvailableYears = () => {
    const years = new Set<number>()
    reservationsWithDetails.forEach(reservation => {
      if (reservation.createdAt) {
        years.add(new Date(reservation.createdAt).getFullYear())
      }
    })
    const yearArray = Array.from(years).sort((a, b) => b - a)
    // Add current year if not present
    if (!yearArray.includes(new Date().getFullYear())) {
      yearArray.unshift(new Date().getFullYear())
    }
    return yearArray
  }

  const availableYears = getAvailableYears()
  
  // Handle calendar event click
  const handleSelectEvent = (event: Event) => {
    const date = event.start as Date
    const reservationsForDay = getReservationsForDate(date)
    setSelectedDate(date)
    setSelectedDateReservations(reservationsForDay)
    setModalOpen(true)
  }
  
  // Handle calendar slot click
  const handleSelectSlot = ({ start }: { start: Date }) => {
    const reservationsForDay = getReservationsForDate(start)
    if (reservationsForDay.length > 0) {
      setSelectedDate(start)
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
    return reservationsWithDetails.filter(reservation => {
      const checkIn = reservation.checkInDate
      const checkOut = reservation.checkOutDate
      if (!checkIn || !checkOut) return false
      
      const checkInDate = checkIn instanceof Date ? checkIn : new Date(checkIn)
      const checkOutDate = checkOut instanceof Date ? checkOut : new Date(checkOut)
      
      // Check if the selected date falls within the reservation period
      // Exclude check-out date (only show actual stay days)
      const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const startDate = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate())
      const endDate = new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate())
      
      return selectedDate >= startDate && selectedDate < endDate
    })
  }

  // Convert reservations to calendar events
  const getCalendarEvents = (): Event[] => {
    const events = reservationsWithDetails.map((reservation) => {
      const checkInDate = reservation.checkInDate ? new Date(reservation.checkInDate) : new Date()
      const checkOutDate = reservation.checkOutDate ? new Date(reservation.checkOutDate) : new Date()
      
      // Set check-in date to start of day
      checkInDate.setHours(0, 0, 0, 0)
      
      // Set end date to the day before check-out (last day of actual stay)
      const endDate = new Date(checkOutDate)
      endDate.setDate(endDate.getDate() - 1)
      endDate.setHours(23, 59, 59, 999)
      
      return {
        id: reservation.id,
        title: `${reservation.customer?.name || 'ลูกค้าที่ถูกลบ'} - ${reservation.rooms?.map(room => room.room?.name).join(', ') || 'ไม่มีข้อมูลห้อง'}`,
        start: checkInDate,
        end: endDate,
        resource: reservation,
        allDay: true,
      }
    })
    
    return events
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
                    {customersLoading ? <CircularProgress size={24} color="inherit" /> : totalCustomers}
                  </Typography>
                  <Typography variant="body1">ลูกค้าทั้งหมด</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              สถิติการจอง
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>ปี</InputLabel>
              <Select
                value={selectedYear}
                label="ปี"
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={6}>
              <Paper elevation={3} sx={{ p: 3, height: 400 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
                  แนวโน้มการจอง ({selectedYear})
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="reservations" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="จำนวนการจอง"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            <Grid item xs={12} lg={6}>
               <Paper elevation={3} sx={{ p: 3, height: 400 }}>
                 <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
                   รายได้ ({selectedYear})
                 </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}K`} />
                    <RechartsTooltip 
                      formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'รายได้']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      fill="#82ca9d" 
                      name="รายได้ (บาท)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Calendar View */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3, height: 820, overflow: 'auto' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
                  ปฏิทินการจอง
                </Typography>
                <Box sx={{ height: 700 }}>
                  <Calendar
                    localizer={localizer}
                    events={getCalendarEvents()}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    view={calendarView}
                    onView={setCalendarView}
                    views={['month', 'week', 'day', 'agenda']}
                    culture="th"
                    messages={{
                      next: 'ถัดไป',
                      previous: 'ก่อนหน้า',
                      today: 'วันนี้',
                      month: 'เดือน',
                      week: 'สัปดาห์',
                      day: 'วัน',
                      agenda: 'รายการ',
                      date: 'วันที่',
                      time: 'เวลา',
                      event: 'การจอง',
                      noEventsInRange: 'ไม่มีการจองในช่วงนี้',
                      showMore: (total) => `+${total} เพิ่มเติม`,
                    }}
                    popup
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Reservations */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3, height: 600, overflow: 'auto' }}>
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
                                   ผู้จอง: {(reservation as ReservationWithDetails).customer?.name || 'ลูกค้าที่ถูกลบ'}
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
          <Grid item xs={12} sm={6}>
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
          
          <Grid item xs={12} sm={6}>
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
                href="/customers" 
                variant="contained" 
                size="large"
                fullWidth
              >
จัดการลูกค้า
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6}>
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
          
          <Grid item xs={12} sm={6}>
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
              <AdminPanelSettings sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                จัดการผู้ใช้
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                จัดการผู้ใช้และข้อมูลผู้ใช้
              </Typography>
              <Button 
                component={Link} 
                href="/users" 
                variant="contained" 
                size="large"
                fullWidth
              >
จัดการผู้ใช้
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
                          ผู้จอง: {reservation.customer?.name || 'ลูกค้าที่ถูกลบ'}
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