'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Alert,
  useTheme,
  useMediaQuery,
  CircularProgress,
  SelectChangeEvent,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import Button from '@/components/Button'
import { useReservations } from '@/hooks/useReservations'
import { useCustomers } from '@/hooks/useCustomers'
import { useRooms } from '@/hooks/useRooms'
import { ReservationFormSchema, CreateReservationData, ReservationWithDetails } from '@/types/reservation'
import { CreateCustomerData, Customer } from '@/types/customer'
import { Room } from '@/types/room'
import { Add as AddIcon } from '@mui/icons-material'
import { z } from 'zod'

type ReservationFormData = z.infer<typeof ReservationFormSchema>
type UseReservationsReturn = ReturnType<typeof useReservations>

interface ReservationFormProps {
  reservationHook?: UseReservationsReturn
  editingReservation?: ReservationWithDetails
  onEditComplete?: () => void
}

export default function ReservationForm({ reservationHook, editingReservation, onEditComplete }: ReservationFormProps) {
  const [formData, setFormData] = useState<ReservationFormData>({
    customerId: editingReservation?.customerId || '',
    roomIds: editingReservation?.rooms?.map(rr => rr.roomId) || [],
    checkInDate: editingReservation?.checkInDate ? new Date(editingReservation.checkInDate) : new Date(),
    checkOutDate: editingReservation?.checkOutDate ? new Date(editingReservation.checkOutDate) : new Date(new Date().setDate(new Date().getDate() + 1)),
    totalAmount: editingReservation?.totalAmount || 0,
    extraBed: editingReservation?.extraBed || false,
    notes: editingReservation?.notes || '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ReservationFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearchValue, setCustomerSearchValue] = useState('')
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([])
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState<CreateCustomerData>({
    name: '',
    address: '',
    taxId: ''
  })
  const [newCustomerErrors, setNewCustomerErrors] = useState<Partial<Record<keyof CreateCustomerData, string>>>({})
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const fallbackHook = useReservations()
  const { createReservation, updateReservation } = reservationHook || fallbackHook
  const isEditing = !!editingReservation
  
  const { customers, createCustomer } = useCustomers()
  const { rooms } = useRooms()

  // Initialize form data when editing
  useEffect(() => {
    if (editingReservation && customers.length > 0 && rooms.length > 0) {
      // Set selected customer
      const customer = customers.find(c => c.id === editingReservation.customerId)
      if (customer) {
        setSelectedCustomer(customer)
        setCustomerSearchValue(`${customer.name} - ${customer.taxId}`)
      }
      
      // Set selected rooms
      const reservationRoomIds = editingReservation.rooms?.map(rr => rr.roomId) || []
      const selectedRoomObjects = rooms.filter(room => 
        reservationRoomIds.includes(room.id!)
      )
      setSelectedRooms(selectedRoomObjects)
    }
  }, [editingReservation, customers, rooms])

  // Calculate number of days between check-in and check-out
  const calculateDays = useCallback(() => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0
    const checkIn = new Date(formData.checkInDate)
    const checkOut = new Date(formData.checkOutDate)
    const timeDiff = checkOut.getTime() - checkIn.getTime()
    return Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))
  }, [formData.checkInDate, formData.checkOutDate])

  // Calculate total amount based on selected rooms, days, and extra bed
  const calculateTotalAmount = useCallback(() => {
    if (selectedRooms.length === 0) return 0
    const days = calculateDays()
    const roomsTotal = selectedRooms.reduce((total, room) => total + (room.price * days), 0)
    const extraBedCost = formData.extraBed ? 100 * days : 0
    return roomsTotal + extraBedCost
  }, [selectedRooms, calculateDays, formData.extraBed])

  // Update total amount whenever rooms or dates change
  useEffect(() => {
    const totalAmount = calculateTotalAmount()
    setFormData(prev => ({ ...prev, totalAmount }))
  }, [calculateTotalAmount])

  const handleChange = (field: keyof ReservationFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    let processedValue: any = value

    if (field === 'checkInDate' || field === 'checkOutDate') {
      processedValue = new Date(value)
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCheckboxChange = (field: keyof ReservationFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked
    setFormData(prev => ({ ...prev, [field]: checked }))
  }

  const handleSelectChange = (field: keyof ReservationFormData) => (
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCustomerChange = (event: any, newValue: Customer | null) => {
    setSelectedCustomer(newValue)
    setFormData(prev => ({ ...prev, customerId: newValue?.id || '' }))
    
    // Clear error for customerId field
    if (errors.customerId) {
      setErrors(prev => ({ ...prev, customerId: '' }))
    }
  }

  const handleNewCustomerChange = (field: keyof CreateCustomerData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    setNewCustomerData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (newCustomerErrors[field]) {
      setNewCustomerErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateNewCustomer = (): boolean => {
    const errors: Partial<Record<keyof CreateCustomerData, string>> = {}
    
    if (!newCustomerData.name.trim()) {
      errors.name = 'Name is required'
    }
    if (!newCustomerData.address.trim()) {
      errors.address = 'Address is required'
    }
    if (!newCustomerData.taxId.trim()) {
      errors.taxId = 'Tax ID is required'
    }
    
    setNewCustomerErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateCustomer = async () => {
    if (!validateNewCustomer()) {
      return
    }

    setIsCreatingCustomer(true)
    try {
      await createCustomer(newCustomerData)
      // Reset form and close dialog
      setNewCustomerData({ name: '', address: '', taxId: '' })
      setOpenCustomerDialog(false)
      // The customers list will be automatically updated by the hook
    } catch (error) {
      console.error('Error creating customer:', error)
    } finally {
      setIsCreatingCustomer(false)
    }
  }

  const validateForm = (): boolean => {
    try {
      ReservationFormSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof ReservationFormData, string>> = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            const field = err.path[0] as keyof ReservationFormData
            fieldErrors[field] = err.message
          }
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      const reservationData: CreateReservationData = {
        customerId: formData.customerId,
        roomIds: formData.roomIds,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        totalAmount: calculateTotalAmount(),
        extraBed: formData.extraBed,
        notes: formData.notes,
      }

      if (isEditing && editingReservation?.id) {
        await updateReservation(editingReservation.id, reservationData)
        setSubmitSuccess(true)
        if (onEditComplete) {
          onEditComplete()
        }
      } else {
        await createReservation(reservationData)
        setSubmitSuccess(true)
        
        // Reset form only when creating
        setFormData({
        customerId: '',
        roomIds: [],
        checkInDate: new Date(),
        checkOutDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        totalAmount: 0,
        extraBed: false,
        notes: '',
      })
        setSelectedCustomer(null)
        setCustomerSearchValue('')
        setSelectedRooms([])
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : (isEditing ? 'Failed to update reservation' : 'Failed to create reservation'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const handleCancel = () => {
    if (isEditing && onEditComplete) {
      onEditComplete()
    } else {
      setFormData({
        customerId: '',
        roomIds: [],
        checkInDate: new Date(),
        checkOutDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        totalAmount: 0,
        extraBed: false,
        notes: '',
      })
    }

    setSelectedCustomer(null)
    setSelectedRooms([])
    setSubmitError(null)
    setSubmitSuccess(false)
  }

  return (
    <Box>
      {!isMobile ? (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            {isEditing ? 'แก้ไขการจอง' : 'เพิ่มการจองใหม่'}
          </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Autocomplete
                  fullWidth
                  options={customers}
                  getOptionLabel={(option) => `${option.name} - ${option.taxId}`}
                  value={selectedCustomer}
                  onChange={handleCustomerChange}
                  inputValue={customerSearchValue}
                  onInputChange={(event, newInputValue) => {
                    setCustomerSearchValue(newInputValue)
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="ค้นหาลูกค้า"
                      error={!!errors.customerId}
                      helperText={errors.customerId}
                      placeholder="พิมพ์เพื่อค้นหาลูกค้า..."
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id}>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tax ID: {option.taxId} | Address: {option.address}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText="ไม่พบลูกค้า"
                />
                <IconButton
                  onClick={() => setOpenCustomerDialog(true)}
                  sx={{ 
                    mt: 1,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                  size="small"
                  aria-label="เพิ่มลูกค้าใหม่"
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                  multiple
                  options={rooms}
                  getOptionLabel={(option) => `${option.name} - $${option.price}/คืน`}
                  value={selectedRooms}
                  onChange={(event, newValue) => {
                    setSelectedRooms(newValue)
                    setFormData(prev => ({ ...prev, roomIds: newValue.map(room => room.id!) }))
                    
                    // Clear error for roomIds field
                    if (errors.roomIds) {
                      setErrors(prev => ({ ...prev, roomIds: '' }))
                    }
                  }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="เลือกห้องพัก"
                    error={!!errors.roomIds}
                    helperText={errors.roomIds}
                    placeholder="เลือกหนึ่งห้องหรือมากกว่า..."
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id}>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${option.price}/คืน
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="วันที่เช็คอิน"
                value={formatDateForInput(formData.checkInDate || new Date())}
                onChange={handleChange('checkInDate')}
                error={!!errors.checkInDate}
                helperText={errors.checkInDate}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiInputBase-root': {
                    cursor: 'pointer',
                  },
                  '& .MuiInputBase-input': {
                    cursor: 'pointer',
                    '&::-webkit-calendar-picker-indicator': {
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="วันที่เช็คเอาท์"
                value={formatDateForInput(formData.checkOutDate || new Date(new Date().setDate(new Date().getDate() + 1)))}
                onChange={handleChange('checkOutDate')}
                error={!!errors.checkOutDate}
                helperText={errors.checkOutDate}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiInputBase-root': {
                    cursor: 'pointer',
                  },
                  '& .MuiInputBase-input': {
                    cursor: 'pointer',
                    '&::-webkit-calendar-picker-indicator': {
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  จำนวนเงินรวม: ${calculateTotalAmount().toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedRooms.length > 0 && formData.checkInDate && formData.checkOutDate
                    ? `${selectedRooms.length} ห้อง × ${calculateDays()} วัน${formData.extraBed ? ' + เตียงเสริม ฿100/วัน' : ''}`
                    : 'เลือกห้องและวันที่เพื่อคำนวณยอดรวม'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.extraBed}
                    onChange={handleCheckboxChange('extraBed')}
                    color="primary"
                  />
                }
                label="เตียงเสริม (+฿100/วัน)"
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>
          
          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}
          
          {submitSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
{isEditing ? 'อัปเดตการจองสำเร็จแล้ว!' : 'สร้างการจองสำเร็จแล้ว!'}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ flex: 1 }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  {isEditing ? 'กำลังอัปเดต...' : 'กำลังสร้าง...'}
                </>
              ) : (
                isEditing ? 'อัปเดตการจอง' : 'สร้างการจอง'
              )}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
              sx={{ flex: 1 }}
            >
              {isEditing ? 'ยกเลิก' : 'ล้างข้อมูล'}
            </Button>
          </Box>
        </Box>
      </Paper>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            {isEditing ? 'แก้ไขการจอง' : 'เพิ่มการจองใหม่'}
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit}>
             <Grid container spacing={2}>
               <Grid item xs={12}>
                 <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                   <Autocomplete
                     fullWidth
                     options={customers}
                     getOptionLabel={(option) => `${option.name} - ${option.taxId}`}
                     value={selectedCustomer}
                     onChange={handleCustomerChange}
                     inputValue={customerSearchValue}
                     onInputChange={(event, newInputValue) => {
                       setCustomerSearchValue(newInputValue)
                     }}
                     renderInput={(params) => (
                       <TextField
                         {...params}
                         label="ค้นหาลูกค้า"
                         error={!!errors.customerId}
                         helperText={errors.customerId}
                         placeholder="พิมพ์เพื่อค้นหาลูกค้า..."
                       />
                     )}
                     renderOption={(props, option) => (
                       <Box component="li" {...props} key={option.id}>
                         <Box>
                           <Typography variant="body1">{option.name}</Typography>
                           <Typography variant="caption" color="text.secondary">
                             Tax ID: {option.taxId} | Address: {option.address}
                           </Typography>
                         </Box>
                       </Box>
                     )}
                     noOptionsText="ไม่พบลูกค้า"
                   />
                   <IconButton
                     onClick={() => setOpenCustomerDialog(true)}
                     sx={{ 
                       mt: 1,
                       bgcolor: 'primary.main',
                       color: 'white',
                       '&:hover': {
                         bgcolor: 'primary.dark'
                       }
                     }}
                     size="small"
                     aria-label="เพิ่มลูกค้าใหม่"
                   >
                     <AddIcon />
                   </IconButton>
                 </Box>
               </Grid>
               
               <Grid item xs={12}>
                 <Autocomplete
                     multiple
                     options={rooms}
                     getOptionLabel={(option) => `${option.name} - $${option.price}/คืน`}
                     value={selectedRooms}
                     onChange={(event, newValue) => {
                       setSelectedRooms(newValue)
                       setFormData(prev => ({ ...prev, roomIds: newValue.map(room => room.id!) }))
                       
                       // Clear error for roomIds field
                       if (errors.roomIds) {
                         setErrors(prev => ({ ...prev, roomIds: '' }))
                       }
                     }}
                   renderInput={(params) => (
                     <TextField
                       {...params}
                       label="เลือกห้องพัก"
                       error={!!errors.roomIds}
                       helperText={errors.roomIds}
                       placeholder="เลือกหนึ่งห้องหรือมากกว่า..."
                     />
                   )}
                   renderOption={(props, option) => (
                     <Box component="li" {...props} key={option.id}>
                       <Box>
                         <Typography variant="body1">{option.name}</Typography>
                         <Typography variant="caption" color="text.secondary">
                           ${option.price}/คืน
                         </Typography>
                       </Box>
                     </Box>
                   )}
                 />
               </Grid>
               
               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   type="date"
                   label="วันที่เช็คอิน"
                   value={formatDateForInput(formData.checkInDate || new Date())}
                   onChange={handleChange('checkInDate')}
                   error={!!errors.checkInDate}
                   helperText={errors.checkInDate}
                   InputLabelProps={{ shrink: true }}
                   sx={{
                     '& .MuiInputBase-root': {
                       cursor: 'pointer',
                     },
                     '& .MuiInputBase-input': {
                       cursor: 'pointer',
                       '&::-webkit-calendar-picker-indicator': {
                         position: 'absolute',
                         left: 0,
                         top: 0,
                         width: '100%',
                         height: '100%',
                         opacity: 0,
                         cursor: 'pointer',
                       },
                     },
                   }}
                 />
               </Grid>
               
               <Grid item xs={12}>
                 <TextField
                   fullWidth
                   type="date"
                   label="วันที่เช็คเอาท์"
                   value={formatDateForInput(formData.checkOutDate || new Date())}
                   onChange={handleChange('checkOutDate')}
                   error={!!errors.checkOutDate}
                   helperText={errors.checkOutDate}
                   InputLabelProps={{ shrink: true }}
                   sx={{
                     '& .MuiInputBase-root': {
                       cursor: 'pointer',
                     },
                     '& .MuiInputBase-input': {
                       cursor: 'pointer',
                       '&::-webkit-calendar-picker-indicator': {
                         position: 'absolute',
                         left: 0,
                         top: 0,
                         width: '100%',
                         height: '100%',
                         opacity: 0,
                         cursor: 'pointer',
                       },
                     },
                   }}
                 />
               </Grid>
               
               <Grid item xs={12}>
                 <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                   <Typography variant="h6" color="primary" gutterBottom>
                     จำนวนเงินรวม: ${calculateTotalAmount().toFixed(2)}
                   </Typography>
                   <Typography variant="body2" color="text.secondary">
                     {selectedRooms.length > 0 && formData.checkInDate && formData.checkOutDate
                       ? `${selectedRooms.length} ห้อง × ${calculateDays()} วัน${formData.extraBed ? ' + เตียงเสริม ฿100/วัน' : ''}`
                       : 'เลือกห้องและวันที่เพื่อคำนวณยอดรวม'}
                   </Typography>
                 </Box>
               </Grid>
               
               <Grid item xs={12}>
                 <FormControlLabel
                   control={
                     <Checkbox
                       checked={formData.extraBed}
                       onChange={handleCheckboxChange('extraBed')}
                       color="primary"
                     />
                   }
                   label="เตียงเสริม (+฿100/วัน)"
                   sx={{ mt: 1 }}
                 />
               </Grid>
             </Grid>
             
             {submitError && (
               <Alert severity="error" sx={{ mt: 2 }}>
                 {submitError}
               </Alert>
             )}
             
             {submitSuccess && (
               <Alert severity="success" sx={{ mt: 2 }}>
{isEditing ? 'อัปเดตการจองสำเร็จแล้ว!' : 'สร้างการจองสำเร็จแล้ว!'}
               </Alert>
             )}
             
             <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
               <Button
                 type="submit"
                 variant="contained"
                 size="large"
                 disabled={isSubmitting}
                 sx={{ flex: 1 }}
               >
                 {isSubmitting ? (
                   <>
                     <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                     {isEditing ? 'กำลังอัปเดต...' : 'กำลังสร้าง...'}
                   </>
                 ) : (
                   isEditing ? 'อัปเดตการจอง' : 'สร้างการจอง'
                 )}
               </Button>
             </Box>
           </Box>
        </Box>
      )}

      {/* New Customer Dialog */}
      <Dialog 
        open={openCustomerDialog} 
        onClose={() => setOpenCustomerDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>เพิ่มลูกค้าใหม่</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ชื่อ"
                  value={newCustomerData.name}
                  onChange={handleNewCustomerChange('name')}
                  error={!!newCustomerErrors.name}
                  helperText={newCustomerErrors.name}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ที่อยู่"
                  value={newCustomerData.address}
                  onChange={handleNewCustomerChange('address')}
                  error={!!newCustomerErrors.address}
                  helperText={newCustomerErrors.address}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="เลขประจำตัวผู้เสียภาษี"
                  value={newCustomerData.taxId}
                  onChange={handleNewCustomerChange('taxId')}
                  error={!!newCustomerErrors.taxId}
                  helperText={newCustomerErrors.taxId}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenCustomerDialog(false)}
            disabled={isCreatingCustomer}
          >
ยกเลิก
          </Button>
          <Button 
            onClick={handleCreateCustomer}
            variant="contained"
            disabled={isCreatingCustomer}
            startIcon={isCreatingCustomer ? <CircularProgress size={20} /> : null}
          >
            {isCreatingCustomer ? 'กำลังสร้าง...' : 'สร้างลูกค้า'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}