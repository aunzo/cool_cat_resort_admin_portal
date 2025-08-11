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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  TextField,
  Tooltip,
  Chip,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext,
} from '@mui/icons-material'
import { User } from '@/types/user'
import { useUsers } from '@/hooks/useUsers'
import UserForm from './UserForm'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const UserDataTable: React.FC = () => {
  const { users, loading, error, deleteUser } = useUsers()
  const [globalFilter, setGlobalFilter] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [showForm, setShowForm] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'ผู้ดูแลระบบ'
      case 'staff': return 'พนักงาน'
      case 'manager': return 'ผู้จัดการ'
      default: return role
    }
  }

  const getRoleColor = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (role) {
      case 'admin': return 'error'
      case 'manager': return 'warning'
      case 'staff': return 'primary'
      default: return 'secondary'
    }
  }

  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      accessorKey: 'username',
      header: 'ชื่อผู้ใช้',
      cell: ({ row }) => (
        <Typography variant="body2" fontWeight="medium">
          {row.original.username}
        </Typography>
      ),
    },
    {
      accessorKey: 'name',
      header: 'ชื่อ-นามสกุล',
      cell: ({ row }) => (
        <Typography variant="body2">
          {row.original.name}
        </Typography>
      ),
    },
    {
      accessorKey: 'role',
      header: 'บทบาท',
      cell: ({ row }) => (
        <Chip
          label={getRoleLabel(row.original.role)}
          color={getRoleColor(row.original.role)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'วันที่สร้าง',
      cell: ({ row }) => (
        <Typography variant="body2" color="text.secondary">
          {format(new Date(row.original.createdAt), 'dd/MM/yyyy HH:mm', { locale: th })}
        </Typography>
      ),
    },
    {
      id: 'actions',
      header: 'จัดการ',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="แก้ไข">
            <IconButton
              size="small"
              onClick={() => {
                setEditingUser(row.original)
                setShowForm(true)
              }}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="ลบ">
            <IconButton
              size="small"
              onClick={() => setDeletingUser(row.original)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [])

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

  const handleDeleteConfirm = async () => {
    if (deletingUser) {
      try {
        await deleteUser(deletingUser.id)
        setDeletingUser(null)
      } catch (error) {
        // Error is handled by the hook
      }
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingUser(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingUser(null)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    )
  }

  if (isMobile) {
    return (
      <Box>
        {/* Search */}
        <TextField
          fullWidth
          placeholder="ค้นหาผู้ใช้..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 2 }}
        />

        {/* Mobile Cards */}
        <Stack spacing={2}>
          {table.getRowModel().rows.map((row) => (
            <Card key={row.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="div">
                    {row.original.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingUser(row.original)
                        setShowForm(true)
                      }}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeletingUser(row.original)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ชื่อผู้ใช้: {row.original.username}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip
                    label={getRoleLabel(row.original.role)}
                    color={getRoleColor(row.original.role)}
                    size="small"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(row.original.createdAt), 'dd/MM/yyyy', { locale: th })}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Mobile Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 1 }}>
          <IconButton
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <FirstPage />
          </IconButton>
          <IconButton
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <NavigateBefore />
          </IconButton>
          
          <Typography variant="body2" sx={{ mx: 2 }}>
            หน้า {table.getState().pagination.pageIndex + 1} จาก {table.getPageCount()}
          </Typography>
          
          <IconButton
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <NavigateNext />
          </IconButton>
          <IconButton
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <LastPage />
          </IconButton>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      {/* Search */}
      <TextField
        fullWidth
        placeholder="ค้นหาผู้ใช้..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
        sx={{ mb: 2 }}
      />

      {/* Desktop Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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

      {/* Desktop Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          แสดง {table.getRowModel().rows.length} จาก {users.length} รายการ
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <FirstPage />
          </IconButton>
          <IconButton
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <NavigateBefore />
          </IconButton>
          
          <Typography variant="body2" sx={{ mx: 2 }}>
            หน้า {table.getState().pagination.pageIndex + 1} จาก {table.getPageCount()}
          </Typography>
          
          <IconButton
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <NavigateNext />
          </IconButton>
          <IconButton
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <LastPage />
          </IconButton>
        </Box>
      </Box>

      {/* Edit/Create Form Dialog */}
      <Dialog
        open={showForm}
        onClose={handleFormCancel}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogContent sx={{ p: 0 }}>
          <UserForm
            user={editingUser}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingUser} onClose={() => setDeletingUser(null)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <Typography>
            คุณต้องการลบผู้ใช้ "{deletingUser?.name}" หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingUser(null)}>ยกเลิก</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserDataTable