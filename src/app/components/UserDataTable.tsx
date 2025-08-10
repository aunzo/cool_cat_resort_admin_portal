'use client'
import React, { useState, useEffect } from 'react'
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
  Pagination,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { User } from '@/types/user'
import { useUsers } from '@/hooks/useUsers'
import UserForm from './UserForm'

interface UserDataTableProps {
  userHook: ReturnType<typeof useUsers>
}

export default function UserDataTable({ userHook }: UserDataTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage] = useState(10)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { users, loading, error } = userHook

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
    user.address.toLowerCase().includes(globalFilter.toLowerCase()) ||
    user.taxId.toLowerCase().includes(globalFilter.toLowerCase())
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage)
  const startIndex = (page - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [globalFilter])

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
      await userHook.deleteUser(userToDelete.id!)
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
      {filteredUsers.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {users.length === 0 ? 'ไม่พบลูกค้า เพิ่มลูกค้าคนแรกด้านบน' : 'ไม่พบลูกค้าที่ตรงกับการค้นหา'}
          </Typography>
        </Box>
      ) : (
        <>
          {paginatedUsers.map((user) => (
            <Card key={user.id} sx={{ mb: 2 }}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h6" component="div">
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>ที่อยู่:</strong> {user.address}
                  </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>เลขประจำตัวผู้เสียภาษี:</strong> {user.taxId}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleEdit(user)}
                    color="primary"
                    startIcon={<EditIcon />}
                  >
แก้ไข
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleDeleteClick(user)}
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
          placeholder="ค้นหาลูกค้า..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          sx={{ maxWidth: 400 }}
          size="small"
        />
        <Typography variant="body2" color="text.secondary">
          {filteredUsers.length > 0 
            ? `แสดง ${startIndex + 1} ถึง ${Math.min(endIndex, filteredUsers.length)} จาก ${filteredUsers.length} ลูกค้า`
            : `${filteredUsers.length} ลูกค้า`
          }
        </Typography>
      </Box>
      {filteredUsers.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {users.length === 0 ? 'ไม่พบลูกค้า เพิ่มลูกค้าคนแรกด้านบน' : 'ไม่พบลูกค้าที่ตรงกับการค้นหา'}
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: 'grey.50' }}>ชื่อ</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: 'grey.50' }}>ที่อยู่</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: 'grey.50' }}>เลขประจำตัวผู้เสียภาษี</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: 'grey.50' }}>การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300 }}>
                        {user.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.taxId}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(user)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(user)}
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
          variant={isMobile ? "h6" : "h5"} 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            mb: { xs: 2, sm: 3 }
          }}
        >
          Users ({users.length})
        </Typography>
        
        <MobileView />
        <DesktopView />
      </Paper>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingUser}
        onClose={handleEditComplete}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {editingUser && (
            <UserForm
              userHook={userHook}
              editingUser={editingUser}
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
            คุณแน่ใจหรือไม่ที่จะลบลูกค้า "{userToDelete?.name}"?
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