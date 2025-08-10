'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  useTheme,
  useMediaQuery,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
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
import { useReservations } from '@/hooks/useReservations'
import { useUsers } from '@/hooks/useUsers'
import { useRooms } from '@/hooks/useRooms'
import { ReservationFormSchema, CreateReservationData, ReservationWithDetails } from '@/types/reservation'
import { CreateUserData, User } from '@/types/user'
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
    userId: editingReservation?.userId || '',
    roomIds: editingReservation?.rooms?.map(rr => rr.roomId) || [],
    checkInDate: editingReservation?.checkInDate ? new Date(editingReservation.checkInDate) : new Date(),
    checkOutDate: editingReservation?.checkOutDate ? new Date(editingReservation.checkOutDate) : new Date(),
    totalAmount: editingReservation?.totalAmount || 0,
    extraBed: editingReservation?.extraBed || false,
    notes: editingReservation?.notes || '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ReservationFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userSearchValue, setUserSearchValue] = useState('')
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([])
  const [openUserDialog, setOpenUserDialog] = useState(false)
  const [newUserData, setNewUserData] = useState<CreateUserData>({
    name: '',
    address: '',
    taxId: ''
  })
  const [newUserErrors, setNewUserErrors] = useState<Partial<Record<keyof CreateUserData, string>>>({})
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const fallbackHook = useReservations()
  const { createReservation, updateReservation } = reservationHook || fallbackHook
  const isEditing = !!editingReservation
  
  const { users, createUser } = useUsers()
  const { rooms } = useRooms()

  // Initialize form data when editing
  useEffect(() => {
    if (editingReservation && users.length > 0 && rooms.length > 0) {
      // Set selected user
      const user = users.find(u => u.id === editingReservation.userId)
      if (user) {
        setSelectedUser(user)
        setUserSearchValue(`${user.name} - ${user.taxId}`)
      }
      
      // Set selected rooms
      const reservationRoomIds = editingReservation.rooms?.map(rr => rr.roomId) || []
      const selectedRoomObjects = rooms.filter(room => 
        reservationRoomIds.includes(room.id!)
      )
      setSelectedRooms(selectedRoomObjects)
    }
  }, [editingReservation, users, rooms])

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

  const handleUserChange = (event: any, newValue: User | null) => {
    setSelectedUser(newValue)
    setFormData(prev => ({ ...prev, userId: newValue?.id || '' }))
    
    // Clear error for userId field
    if (errors.userId) {
      setErrors(prev => ({ ...prev, userId: '' }))
    }
  }

  const handleNewUserChange = (field: keyof CreateUserData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    setNewUserData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (newUserErrors[field]) {
      setNewUserErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateNewUser = (): boolean => {
    const errors: Partial<Record<keyof CreateUserData, string>> = {}
    
    if (!newUserData.name.trim()) {
      errors.name = 'Name is required'
    }
    if (!newUserData.address.trim()) {
      errors.address = 'Address is required'
    }
    if (!newUserData.taxId.trim()) {
      errors.taxId = 'Tax ID is required'
    }
    
    setNewUserErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateUser = async () => {
    if (!validateNewUser()) {
      return
    }

    setIsCreatingUser(true)
    try {
      await createUser(newUserData)
      // Reset form and close dialog
      setNewUserData({ name: '', address: '', taxId: '' })
      setOpenUserDialog(false)
      // The users list will be automatically updated by the hook
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setIsCreatingUser(false)
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
        userId: formData.userId,
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
        userId: '',
        roomIds: [],
        checkInDate: new Date(),
        checkOutDate: new Date(),
        totalAmount: 0,
        extraBed: false,
        notes: '',
      })
        setSelectedUser(null)
        setUserSearchValue('')
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

  return (
    <Box>
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
{isEditing ? 'แก้ไขการจอง' : 'เพิ่มการจองใหม่'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Autocomplete
                  fullWidth
                  options={users}
                  getOptionLabel={(option) => `${option.name} - ${option.taxId}`}
                  value={selectedUser}
                  onChange={handleUserChange}
                  inputValue={userSearchValue}
                  onInputChange={(event, newInputValue) => {
                    setUserSearchValue(newInputValue)
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="ค้นหาลูกค้า"
                      error={!!errors.userId}
                      helperText={errors.userId}
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
                  onClick={() => setOpenUserDialog(true)}
                  sx={{ 
                    mt: 1,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                  size="small"
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
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="วันที่เช็คเอาท์"
                value={formatDateForInput(formData.checkOutDate || new Date())}
                onChange={handleChange('checkOutDate')}
                error={!!errors.checkOutDate}
                helperText={errors.checkOutDate}
                InputLabelProps={{ shrink: true }}
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
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
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

      {/* New User Dialog */}
      <Dialog 
        open={openUserDialog} 
        onClose={() => setOpenUserDialog(false)}
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
                  value={newUserData.name}
                  onChange={handleNewUserChange('name')}
                  error={!!newUserErrors.name}
                  helperText={newUserErrors.name}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ที่อยู่"
                  value={newUserData.address}
                  onChange={handleNewUserChange('address')}
                  error={!!newUserErrors.address}
                  helperText={newUserErrors.address}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="เลขประจำตัวผู้เสียภาษี"
                  value={newUserData.taxId}
                  onChange={handleNewUserChange('taxId')}
                  error={!!newUserErrors.taxId}
                  helperText={newUserErrors.taxId}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenUserDialog(false)}
            disabled={isCreatingUser}
          >
ยกเลิก
          </Button>
          <Button 
            onClick={handleCreateUser}
            variant="contained"
            disabled={isCreatingUser}
            startIcon={isCreatingUser ? <CircularProgress size={20} /> : null}
          >
            {isCreatingUser ? 'กำลังสร้าง...' : 'สร้างลูกค้า'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}