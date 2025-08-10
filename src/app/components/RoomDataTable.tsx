'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  Pagination,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useRooms } from '@/hooks/useRooms'
import { Room } from '@/types/room'
import RoomForm from './RoomForm'

type UseRoomsReturn = ReturnType<typeof useRooms>

interface RoomDataTableProps {
  roomHook?: UseRoomsReturn
}

export default function RoomDataTable({ roomHook }: RoomDataTableProps) {
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage] = useState(10)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const fallbackHook = useRooms()
  const { rooms, loading, error } = roomHook || fallbackHook

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
    (room.id && room.id.toLowerCase().includes(globalFilter.toLowerCase()))
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredRooms.length / rowsPerPage)
  const startIndex = (page - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedRooms = filteredRooms.slice(startIndex, endIndex)

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [globalFilter])

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
  }

  const handleEditComplete = () => {
    setEditingRoom(null)
  }

  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return

    setIsDeleting(true)
    try {
      await (roomHook || fallbackHook).removeRoom(roomToDelete.id!)
      setDeleteConfirmOpen(false)
      setRoomToDelete(null)
    } catch (error) {
      console.error('Error deleting room:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false)
    setRoomToDelete(null)
  }

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          กำลังโหลดห้องพัก...
        </Typography>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Paper>
    )
  }

  // Mobile card view
  const MobileView = () => (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="ค้นหาห้องพัก..."
        value={globalFilter ?? ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        sx={{ mb: 2 }}
        size="small"
      />
      {filteredRooms.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {rooms.length === 0 ? 'ไม่พบห้องพัก เพิ่มห้องพักแรกด้านบน' : 'ไม่พบห้องพักที่ตรงกับการค้นหา'}
          </Typography>
        </Box>
      ) : (
        <>
          {paginatedRooms.map((room) => (
            <Card key={room.id} sx={{ mb: 2 }}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h6" component="div">
                    {room.name}
                  </Typography>

                  <Typography variant="body1" fontWeight="bold" color="primary">
                    ฿{room.price.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEdit(room)}
                      color="primary"
                      startIcon={<EditIcon />}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleDeleteClick(room)}
                      color="error"
                      startIcon={<DeleteIcon />}
                    >
                      ลบ
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3, gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                หน้า {page} จาก {totalPages}
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                size="medium"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )

  // Desktop table view
  const DesktopView = () => (
    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="ค้นหาห้องพัก..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          sx={{ maxWidth: 400 }}
          size="small"
        />
        <Typography variant="body2" color="text.secondary">
          {filteredRooms.length > 0 
            ? `แสดง ${startIndex + 1} ถึง ${Math.min(endIndex, filteredRooms.length)} จาก ${filteredRooms.length} ห้องพัก`
            : `${filteredRooms.length} ห้องพัก`
          }
        </Typography>
      </Box>
      
      {filteredRooms.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {rooms.length === 0 ? 'ไม่พบห้องพัก เพิ่มห้องพักแรกด้านบน' : 'ไม่พบห้องพักที่ตรงกับการค้นหา'}
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: 'grey.50' }}>ชื่อห้อง</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: 'grey.50' }}>ราคา</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: 'grey.50' }}>การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRooms.map((room) => (
                  <TableRow key={room.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {room.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        ฿{room.price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(room)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(room)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )

  return (
    <>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            mb: { xs: 2, sm: 3 }
          }}
        >
          ห้องพัก ({rooms.length})
        </Typography>
        
        <MobileView />
        <DesktopView />
      </Paper>

      {/* Edit Room Dialog */}
      <Dialog open={!!editingRoom} onClose={handleEditComplete} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <RoomForm 
            roomHook={roomHook} 
            editingRoom={editingRoom || undefined}
            onEditComplete={handleEditComplete}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <Typography>
            คุณแน่ใจหรือไม่ที่จะลบห้องพัก "{roomToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>ยกเลิก</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : undefined}
          >
            {isDeleting ? 'กำลังลบ...' : 'ลบ'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}