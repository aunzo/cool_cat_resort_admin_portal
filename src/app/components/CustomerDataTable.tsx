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
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { Customer } from '@/types/customer'
import { useCustomers } from '@/hooks/useCustomers'
import CustomerForm from './CustomerForm'

interface CustomerDataTableProps {
  customerHook: ReturnType<typeof useCustomers>
}

export default function CustomerDataTable({ customerHook }: CustomerDataTableProps) {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { customers, loading, error } = customerHook

  // Handler functions for actions
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
  }

  const handleEditComplete = () => {
    setEditingCustomer(null)
  }

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return

    setIsDeleting(true)
    try {
      await customerHook.deleteCustomer(customerToDelete.id!)
      setDeleteConfirmOpen(false)
      setCustomerToDelete(null)
    } catch (error) {
      console.error('Error deleting customer:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false)
    setCustomerToDelete(null)
  }

  // TanStack Table columns definition
  const columns = useMemo<ColumnDef<Customer>[]>(
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
        accessorKey: 'address',
        header: 'ที่อยู่',
        cell: (info) => (
          <Typography variant="body2" sx={{ maxWidth: 300 }}>
            {info.getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'taxId',
        header: 'เลขประจำตัวผู้เสียภาษี',
        cell: (info) => (
          <Typography variant="body2">
            {info.getValue() as string}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'การดำเนินการ',
        cell: (info) => {
          const customer = info.row.original
          return (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title="แก้ไข">
                <IconButton
                  size="small"
                  onClick={() => handleEdit(customer)}
                  color="primary"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="ลบ">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(customer)}
                  color="error"
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
    data: customers,
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
กำลังโหลดลูกค้า...
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
        placeholder="ค้นหาลูกค้า..."
        value={globalFilter ?? ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        sx={{ mb: 2 }}
        size="small"
      />
      {table.getRowModel().rows.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {customers.length === 0 ? 'ไม่พบลูกค้า เพิ่มลูกค้าคนแรกด้านบน' : 'ไม่พบลูกค้าที่ตรงกับการค้นหา'}
          </Typography>
        </Box>
      ) : (
        <>
          {table.getRowModel().rows.map((row) => {
            const customer = row.original
            return (
              <Card key={customer.id} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent sx={{ pb: 2 }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {customer.name}
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        <strong>ที่อยู่:</strong> {customer.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        <strong>เลขประจำตัวผู้เสียภาษี:</strong> {customer.taxId}
                      </Typography>
                    </Stack>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      mt: 2,
                      justifyContent: 'flex-end'
                    }}>
                      <Button
                        size="medium"
                        variant="outlined"
                        onClick={() => handleEdit(customer)}
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
                        onClick={() => handleDeleteClick(customer)}
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
          placeholder="ค้นหาลูกค้า..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          sx={{ width: '100%' }}
          size="small"
        />
      </Box>
      {table.getRowModel().rows.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {customers.length === 0 ? 'ไม่พบลูกค้า เพิ่มลูกค้าคนแรกด้านบน' : 'ไม่พบลูกค้าที่ตรงกับการค้นหา'}
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
                แสดง {table.getRowModel().rows.length} จาก {customers.length} รายการ
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

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCustomer}
        onClose={handleEditComplete}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {editingCustomer && (
            <CustomerForm
              customerHook={customerHook}
              editingCustomer={editingCustomer}
              onEditComplete={handleEditComplete}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>
ยืนยันการลบ
        </DialogTitle>
        <DialogContent>
          <Typography>
            คุณแน่ใจหรือไม่ที่จะลบลูกค้า "{customerToDelete?.name}"?
            การดำเนินการนี้ไม่สามารถยกเลิกได้
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            disabled={isDeleting}
          >
ยกเลิก
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={20} /> : 'ลบ'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}