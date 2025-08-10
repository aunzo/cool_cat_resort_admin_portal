'use client'
import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
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
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material'
import { Edit, Delete, Visibility } from '@mui/icons-material'
import { useReservations } from '@/hooks/useReservations'
import { ReservationWithDetails } from '@/types/reservation'
import PDFExport from '@/components/PDFExport'
import ReservationForm from './ReservationForm'

type UseReservationsReturn = ReturnType<typeof useReservations>

interface ReservationDataTableProps {
  reservationHook?: UseReservationsReturn
}

export default function ReservationDataTable({ reservationHook }: ReservationDataTableProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithDetails | null>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const fallbackHook = useReservations()
  const { reservationsWithDetails, loading, error, deleteReservation } = reservationHook || fallbackHook

  // Handler functions for actions
  const handleViewReservation = (reservation: ReservationWithDetails) => {
    setSelectedReservation(reservation)
    setViewDialogOpen(true)
  }

  const handleEditReservation = (reservation: ReservationWithDetails) => {
    setSelectedReservation(reservation)
    setEditDialogOpen(true)
  }

  const handleEditComplete = () => {
    setEditDialogOpen(false)
    setSelectedReservation(null)
  }

  const handleDeleteClick = (reservation: ReservationWithDetails) => {
    setSelectedReservation(reservation)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedReservation?.id) {
      try {
        await deleteReservation(selectedReservation.id)
        setDeleteDialogOpen(false)
        setSelectedReservation(null)
      } catch (error) {
        console.error('Error deleting reservation:', error)
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSelectedReservation(null)
  }

  const columns = useMemo<ColumnDef<ReservationWithDetails>[]>(
    () => [
      {
         accessorKey: 'number',
         header: '#',
         cell: (info) => {
           const number = info.getValue() as number
           return number ? `#${number}` : 'N/A'
         },
       },
      {
        accessorKey: 'user.name',
        header: 'ชื่อแขก',
        cell: (info) => info.getValue() || 'ลูกค้าที่ถูกลบ',
      },
      {
        accessorKey: 'user.taxId',
        header: 'เลขประจำตัวผู้เสียภาษี',
        cell: (info) => info.getValue() || 'N/A',
      },
      {
        accessorKey: 'rooms',
        header: 'ห้องพัก',
        cell: (info) => {
          const rooms = info.getValue() as any[]
          return rooms && rooms.length > 0 
            ? rooms.map(reservationRoom => reservationRoom.room?.name || 'ไม่ทราบชื่อห้อง').join(', ') 
            : 'ไม่มีห้องพัก'
        },
      },
      {
        accessorKey: 'checkInDate',
        header: 'เช็คอิน',
        cell: (info) => {
          const dateValue = info.getValue() as string | Date | null
          const date = dateValue ? new Date(dateValue) : null
          return date && !isNaN(date.getTime()) ? date.toLocaleDateString() : 'N/A'
        },
      },
      {
        accessorKey: 'checkOutDate',
        header: 'เช็คเอาท์',
        cell: (info) => {
          const dateValue = info.getValue() as string | Date | null
          const date = dateValue ? new Date(dateValue) : null
          return date && !isNaN(date.getTime()) ? date.toLocaleDateString() : 'N/A'
        },
      },
      {
        accessorKey: 'totalAmount',
        header: 'จำนวนเงินรวม',
        cell: (info) => `$${(info.getValue() as number).toFixed(2)}`,
      },
      {
        id: 'actions',
        header: 'การดำเนินการ',
        cell: (info) => {
          const reservation = info.row.original
          return (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title="ดูรายละเอียด">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleViewReservation(reservation)}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="แก้ไข">
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={() => handleEditReservation(reservation)}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="ลบ">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(reservation)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
              <PDFExport 
                reservation={reservation}
                onExport={() => console.log('PDF exported for reservation:', reservation.id)}
              />
            </Box>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: reservationsWithDetails,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          กำลังโหลดการจอง...
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
        placeholder="ค้นหาการจอง..."
        value={globalFilter ?? ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        sx={{ mb: 2 }}
        size="small"
      />
      {table.getRowModel().rows.map((row) => {
        const reservation = row.original
        return (
          <Card key={reservation.id} sx={{ mb: 2 }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6" component="div">
                  {reservation.user?.name || 'ลูกค้าที่ถูกลบ'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>หมายเลขการจอง:</strong> {reservation.number ? `#${reservation.number}` : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>เลขประจำตัวผู้เสียภาษี:</strong> {reservation.user?.taxId || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>ห้องพัก:</strong> {reservation.rooms && reservation.rooms.length > 0 
                    ? reservation.rooms.map(reservationRoom => reservationRoom.room?.name || 'ไม่ทราบชื่อห้อง').join(', ') 
                    : 'ไม่มีห้องพัก'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>เช็คอิน:</strong> {reservation.checkInDate ? new Date(reservation.checkInDate).toLocaleDateString() : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>เช็คเอาท์:</strong> {reservation.checkOutDate ? new Date(reservation.checkOutDate).toLocaleDateString() : 'N/A'}
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="primary">
                  ${reservation.totalAmount?.toFixed(2) || '0.00'}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Tooltip title="ดูรายละเอียด">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewReservation(reservation)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="แก้ไข">
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleEditReservation(reservation)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="ลบ">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(reservation)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <PDFExport 
                    reservation={reservation}
                    onExport={() => console.log('PDF exported for reservation:', reservation.id)}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )
      })}
    </Box>
  )

  // Desktop table view
  const DesktopView = () => (
    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          placeholder="ค้นหาการจอง..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          sx={{ width: '300px' }}
        />
        <Typography variant="body2" color="text.secondary">
          {table.getFilteredRowModel().rows.length} การจอง
        </Typography>
      </Box>
      
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    sx={{
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                      fontWeight: 600,
                      backgroundColor: 'grey.50',
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} hover>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Typography 
        variant={isMobile ? "h6" : "h5"} 
        component="h2" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          color: 'primary.main',
          mb: { xs: 2, sm: 3 }
        }}
      >
        Reservations ({reservationsWithDetails.length})
      </Typography>
      
      <MobileView />
      <DesktopView />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          ยืนยันการลบการจอง
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            คุณแน่ใจหรือไม่ที่จะลบการจอง {selectedReservation?.number ? `#${selectedReservation.number}` : ''}
            ของ {selectedReservation?.user?.name || 'ลูกค้าที่ถูกลบ'}? การดำเนินการนี้ไม่สามารถยกเลิกได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            ยกเลิก
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            ลบ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Reservation Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          แก้ไขการจอง {selectedReservation?.number ? `#${selectedReservation.number}` : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <ReservationForm 
              reservationHook={reservationHook}
              editingReservation={selectedReservation || undefined}
              onEditComplete={handleEditComplete}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            ยกเลิก
          </Button>
        </DialogActions>
       </Dialog>

       {/* View Reservation Dialog */}
       <Dialog 
         open={viewDialogOpen} 
         onClose={() => setViewDialogOpen(false)}
         maxWidth="sm"
         fullWidth
       >
         <DialogTitle>
           รายละเอียดการจอง {selectedReservation?.number ? `#${selectedReservation.number}` : ''}
         </DialogTitle>
         <DialogContent>
           <Box sx={{ pt: 2 }}>
             {selectedReservation && (
               <Stack spacing={2}>
                 <Box>
                   <Typography variant="subtitle2" color="text.secondary">ชื่อลูกค้า</Typography>
                   <Typography variant="body1">{selectedReservation.user?.name || 'ลูกค้าที่ถูกลบ'}</Typography>
                 </Box>
                 <Box>
                   <Typography variant="subtitle2" color="text.secondary">เลขประจำตัวผู้เสียภาษี</Typography>
                   <Typography variant="body1">{selectedReservation.user?.taxId || 'N/A'}</Typography>
                 </Box>
                 <Box>
                   <Typography variant="subtitle2" color="text.secondary">ที่อยู่</Typography>
                   <Typography variant="body1">{selectedReservation.user?.address || 'N/A'}</Typography>
                 </Box>
                 <Box>
                   <Typography variant="subtitle2" color="text.secondary">ห้องพัก</Typography>
                   <Typography variant="body1">
                     {selectedReservation.rooms && selectedReservation.rooms.length > 0 
                       ? selectedReservation.rooms.map(rr => rr.room?.name || 'ไม่ทราบชื่อห้อง').join(', ') 
                       : 'ไม่มีห้องพัก'}
                   </Typography>
                 </Box>
                 <Box>
                   <Typography variant="subtitle2" color="text.secondary">วันที่เช็คอิน</Typography>
                   <Typography variant="body1">
                     {selectedReservation.checkInDate ? new Date(selectedReservation.checkInDate).toLocaleDateString() : 'N/A'}
                   </Typography>
                 </Box>
                 <Box>
                   <Typography variant="subtitle2" color="text.secondary">วันที่เช็คเอาท์</Typography>
                   <Typography variant="body1">
                     {selectedReservation.checkOutDate ? new Date(selectedReservation.checkOutDate).toLocaleDateString() : 'N/A'}
                   </Typography>
                 </Box>
                 <Box>
                   <Typography variant="subtitle2" color="text.secondary">จำนวนเงินรวม</Typography>
                   <Typography variant="body1">฿{selectedReservation.totalAmount?.toLocaleString() || '0'}</Typography>
                 </Box>
                 <Box>
                   <Typography variant="subtitle2" color="text.secondary">เตียงเสริม</Typography>
                   <Typography variant="body1">{selectedReservation.extraBed ? 'มี (+฿100/วัน)' : 'ไม่มี'}</Typography>
                 </Box>
                 {selectedReservation.notes && (
                   <Box>
                     <Typography variant="subtitle2" color="text.secondary">หมายเหตุ</Typography>
                     <Typography variant="body1">{selectedReservation.notes}</Typography>
                   </Box>
                 )}
               </Stack>
             )}
           </Box>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setViewDialogOpen(false)}>
             ปิด
           </Button>
         </DialogActions>
       </Dialog>
     </Paper>
   )
 }