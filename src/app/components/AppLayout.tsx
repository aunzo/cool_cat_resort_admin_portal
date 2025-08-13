'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
  Menu,
  MenuItem,
  Avatar,
  CircularProgress,
} from '@mui/material'
import Button from '@/components/Button'
import {
  Hotel,
  Person,
  Home,
  CalendarToday,
  Menu as MenuIcon,
  Close as CloseIcon,
  Logout,
  AdminPanelSettings,
} from '@mui/icons-material'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import logoImage from '@/assets/images/logos/logo-cchouse-2021.png'

const menuItems = [
  { text: 'หน้าหลัก', icon: <Home />, href: '/' },
  { text: 'ห้องพัก', icon: <Hotel />, href: '/rooms' },
  { text: 'ลูกค้า', icon: <Person />, href: '/customers' },
  { text: 'การจอง', icon: <CalendarToday />, href: '/reservations' },
  { text: 'ผู้ใช้', icon: <AdminPanelSettings />, href: '/users' },
]

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function AppLayout({ children, title = 'Cool Cat Resort - ระบบจัดการ' }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { data: session, status } = useSession()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    )
  }

  // Don't render anything if not authenticated
  if (!session) {
    return null
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleUserMenuClose()
    await signOut({ callbackUrl: '/auth/login' })
  }

  const mobileDrawerContent = (
    <Box sx={{ width: 280, height: '100%' }}>
      {/* Mobile Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1995AD 0%, #A1D6E2 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src={logoImage}
            alt="Cool Cat House Logo"
            width={40}
            height={40}
            style={{
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.3)',
              marginRight: '8px',
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
            Cool Cat Resort
          </Typography>
        </Box>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Mobile Navigation */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link href={item.href} style={{ textDecoration: 'none', width: '100%' }}>
              <ListItemButton
                onClick={handleDrawerToggle}
                sx={{
                  py: 1.5,
                  mx: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
        
        {/* Mobile User Info and Logout */}
        {session && (
          <>
            <Divider sx={{ my: 2 }} />
            <ListItem>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', mr: 2 }}>
                  {session.user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {session.user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {session.user.username}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  mx: 1,
                  borderRadius: 2,
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
                  <Logout />
                </ListItemIcon>
                <ListItemText
                  primary="ออกจากระบบ"
                  primaryTypographyProps={{
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(135deg, #147a8f 0%, #2a9d8f 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          margin: '16px',
          borderRadius: '16px',
          maxWidth: 'calc(100% - 32px)',
          width: 'auto',
        }}
      >
        <Toolbar sx={{ px: { xs: 3, md: 5 }, py: 1.5 }}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: { xs: 0, md: 4 } }}>
            <Image
              src={logoImage}
              alt="Cool Cat House Logo"
              width={isMobile ? 40 : 50}
              height={isMobile ? 40 : 50}
              style={{
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                marginRight: isMobile ? '8px' : '12px',
              }}
            />
            <Box>
              <Typography
                variant={isMobile ? 'subtitle1' : 'h6'}
                sx={{
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: 1.2,
                }}
              >
                Cool Cat Resort
              </Typography>
              {!isMobile && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.75rem',
                  }}
                >
                  ระบบจัดการ
                </Typography>
              )}
            </Box>
          </Box>

          {/* Desktop Navigation Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, ml: 'auto', alignItems: 'center' }}>
              {menuItems.map((item) => (
                <Link key={item.text} href={item.href} style={{ textDecoration: 'none' }}>
                  <Button
                    startIcon={item.icon}
                    sx={{
                      color: 'white !important',
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      backgroundColor: 'transparent',
                      border: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white !important',
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                </Link>
              ))}
              
              {/* User Menu */}
              {session && (
                <Box sx={{ ml: 2, border: '2px solid white', borderRadius: 16 }}>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{
                      color: 'white',
                      backgroundColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'secondary.main',
                      },
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent' }}>
                      {session.user.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleUserMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem disabled>
                      <Box>
                        <Typography variant="subtitle2">{session.user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {session.user.username}
                        </Typography>
                      </Box>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <Logout fontSize="small" />
                      </ListItemIcon>
                      ออกจากระบบ
                    </MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>
          )}
        </Toolbar>


      </AppBar>

       {/* Mobile Drawer */}
       <Drawer
         variant="temporary"
         open={mobileOpen}
         onClose={handleDrawerToggle}
         ModalProps={{
           keepMounted: true, // Better open performance on mobile
         }}
         sx={{
           display: { xs: 'block', md: 'none' },
           '& .MuiDrawer-paper': {
             boxSizing: 'border-box',
             width: 280,
           },
         }}
       >
         {mobileDrawerContent}
       </Drawer>

       {/* Main Content */}
       <Box
         sx={{
           flex: 1,
           py: { xs: 2, md: 3 },
           px: { xs: 2, md: 3 },
           mx: 2,
           my: 2,
           minHeight: 'calc(100vh - 200px)',
           maxHeight: 'calc(100vh - 200px)',
           overflow: 'auto',
           width: 'calc(100% - 32px)',
         }}
       >
         {children}
       </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 2,
          textAlign: 'center',
          background: 'transparent',
          mx: 2,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontStyle: 'italic',
          }}
        >
          © 2024 Cool Cat Resort
        </Typography>
      </Box>
    </Box>
  )
}