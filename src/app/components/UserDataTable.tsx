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
  Chip,
} from '@mui/material'
import Button from '@/components/Button'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useUsers } from '@/hooks/useUsers'
import { User } from '@/types/user'
import UserForm from './UserForm'

type UseUsersReturn = ReturnType<typeof useUsers>

interface UserDataTableProps {
  userHook?: UseUsersReturn
}

export default function UserDataTable({ userHook }: UserDataTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const fallbackHook = useUsers()
  const { users, loading, error } = userHook || fallbackHook

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'ผู้ดูแลระบบ'
      case 'STAFF':
        return 'พนักงาน'
      default:
        return role
    }
  }

  const getRoleColor = (role: string): 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    switch (role) {
      case 'ADMIN':
        return 'error'
      case 'STAFF':
        return 'primary'
      default:
        return 'secondary'
    }
  }

  // Handler functions for actions
  const handleEdit = (user: User) => {
    setEditingUser(user)
  }

  const handleEditComplete = () => {
    setEditingUser(null)
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    setIsDeleting(true)
    try {
      await (userHook || fallbackHook).deleteUser(userToDelete.id)
      setDeleteConfirmOpen(false)
      setUserToDelete(null)
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false)
    setUserToDelete(null)
  }

  // TanStack Table columns definition
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'ชื่อ',
        cell: (info) => (
          <Typography variant="body2" fontWeight="medium">
            {info.getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'username',
        header: 'ชื่อผู้ใช้',
        cell: (info) => (
          <Typography variant="body2" color="text.secondary">
            {info.getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'role',
        header: 'บทบาท',
        cell: (info) => {
          const role = info.getValue() as string
          return (
            <Chip
              label={getRoleLabel(role)}
              color={getRoleColor(role)}
              size="small"
              sx={{ fontWeight: 500 }}
            />
          )
        },
      },
      {
        id: 'actions',
        header: 'การดำเนินการ',
        cell: (info) => {
          const user = info.row.original
          return (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title="แก้ไข">
                <IconButton
                  size="small"
                  onClick={() => handleEdit(user)}
                  color="primary"
                  aria-label="แก้ไขผู้ใช้"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="ลบ">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(user)}
                  color="error"
                  aria-label="ลบผู้ใช้"
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
    data: users,
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
          กำลังโหลดผู้ใช้...
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
        placeholder="ค้นหาผู้ใช้..."
        value={globalFilter ?? ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        sx={{ mb: 2 }}
        size="small"
      />
      {table.getRowModel().rows.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {users.length === 0 ? 'ไม่พบผู้ใช้ เพิ่มผู้ใช้แรกด้านบน' : 'ไม่พบผู้ใช้ที่ตรงกับการค้นหา'}
          </Typography>
        </Box>
      ) : (
        <>
          {table.getRowModel().rows.map((row) => {
            const user = row.original
            return (
              <Card key={user.id} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent sx={{ pb: 2 }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{user.username}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      gap: 2,
                      mt: 2,
                      justifyContent: 'flex-end'
                    }}>
                      <Button
                        size="medium"
                        variant="outlined"
                        onClick={() => handleEdit(user)}
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
                        onClick={() => handleDeleteClick(user)}
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
                >
                  {'<<'}
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  sx={{ minWidth: 48, minHeight: 48 }}
                >
                  {'<'}
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  sx={{ minWidth: 48, minHeight: 48 }}
                >
                  {'>'}
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  sx={{ minWidth: 48, minHeight: 48 }}
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
          placeholder="ค้นหาผู้ใช้..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          sx={{ width: '100%' }}
          size="small"
        />
      </Box>

      {table.getRowModel().rows.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {users.length === 0 ? 'ไม่พบห้องพัก เพิ่มห้องพักแรกด้านบน' : 'ไม่พบห้องพักที่ตรงกับการค้นหา'}
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

          {table.getRowModel().rows.length > 0 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                แสดง {table.getRowModel().rows.length} จาก {users.length} รายการ
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="ไปหน้าแรก"
                >
                  {'<<'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="หน้าก่อนหน้า"
                >
                  {'<'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="หน้าถัดไป"
                >
                  {'>'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  aria-label="ไปหน้าสุดท้าย"
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

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onClose={handleEditComplete} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <UserForm
            user={editingUser || undefined}
            onSuccess={async () => {
              await (userHook || fallbackHook).refreshUsers()
              handleEditComplete()
            }}
            onCancel={handleEditComplete}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <Typography>
            คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "{userToDelete?.name}"?
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