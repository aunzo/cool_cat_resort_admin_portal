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
  Card,
  CardContent,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material'
import Button from '@/components/Button'
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
  const fallbackHook = useRooms()
  const { rooms, loading } = roomHook || fallbackHook

  // Handler functions for actions
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

  // TanStack Table columns definition
  const columns = useMemo<ColumnDef<Room>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'ชื่อห้อง',
        cell: (info) => (
          <Typography variant="body2" fontWeight="medium">
            {info.getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'price',
        header: 'ราคา',
        cell: (info) => (
          <Typography variant="body2" fontWeight="bold" color="primary">
            ฿{(info.getValue() as number).toFixed(2)}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'การดำเนินการ',
        cell: (info) => {
          const room = info.row.original
          return (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title="แก้ไข">
                <IconButton
                  size="small"
                  onClick={() => handleEdit(room)}
                  color="primary"
                  aria-label="แก้ไขห้องพัก"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="ลบ">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(room)}
                  color="error"
                  aria-label="ลบห้องพัก"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )
        },
      },
    ],
    []
  )

  // TanStack Table configuration
  const table = useReactTable({
    data: rooms,
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
          กำลังโหลดห้องพัก...
        </Typography>
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
      {table.getRowModel().rows.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {rooms.length === 0 ? 'ไม่พบห้องพัก เพิ่มห้องพักแรกด้านบน' : 'ไม่พบห้องพักที่ตรงกับการค้นหา'}
          </Typography>
        </Box>
      ) : (
        <>
          {table.getRowModel().rows.map((row) => {
            const room = row.original
            return (
              <Card key={room.id} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent sx={{ pb: 2 }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {room.name}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                       ฿{room.price.toLocaleString()}
                     </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      mt: 2,
                      justifyContent: 'flex-end'
                    }}>
                      <Button
                        size="medium"
                        variant="outlined"
                        onClick={() => handleEdit(room)}
                        color="primary"
                        startIcon={<EditIcon />}
                        sx={{ 
                          minHeight: 44,
                          px: 3,
                          borderRadius: 2
                        }}
                      >
                        แก้ไข
                      </Button>
                      <Button
                        size="medium"
                        variant="outlined"
                        onClick={() => handleDeleteClick(room)}
                        color="error"
                        startIcon={<DeleteIcon />}
                        sx={{ 
                          minHeight: 44,
                          px: 3,
                          borderRadius: 2
                        }}
                      >
                        ลบ
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )
          })}
          {table.getPageCount() > 1 && (
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                textAlign="center"
                sx={{ mb: 2 }}
              >
                หน้า {table.getState().pagination.pageIndex + 1} จาก {table.getPageCount()}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 2,
                flexWrap: 'wrap'
              }}>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  sx={{ minWidth: 48, minHeight: 48 }}
                  aria-label="ไปหน้าแรก"
                >
                  {'<<'}
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  sx={{ minWidth: 48, minHeight: 48 }}
                  aria-label="หน้าก่อนหน้า"
                >
                  {'<'}
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  sx={{ minWidth: 48, minHeight: 48 }}
                  aria-label="หน้าถัดไป"
                >
                  {'>'}
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  sx={{ minWidth: 48, minHeight: 48 }}
                  aria-label="ไปหน้าสุดท้าย"
                >
                  {'>>'}
                </Button>
              </Box>
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
          sx={{ width: '100%' }}
          size="small"
        />
      </Box>
      
      {table.getRowModel().rows.length === 0 ? (
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
                          asc: ' ⬆️',
                          desc: ' ⬇️',
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
          
          {table.getPageCount() > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                แสดง {table.getRowModel().rows.length} จาก {rooms.length} รายการ
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                หน้า {table.getState().pagination.pageIndex + 1} จาก {table.getPageCount()}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  )

  return (
    <>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
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