'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Container,
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
} from '@mui/material'
import {
  Hotel,
  Person,
  Home,
  CalendarToday,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import Image from 'next/image'
import logoImage from '@/assets/images/logos/logo-cchouse-2021.png'

const menuItems = [
  { text: 'หน้าหลัก', icon: <Home />, href: '/' },
  { text: 'ห้องพัก', icon: <Hotel />, href: '/rooms' },
  { text: 'ลูกค้า', icon: <Person />, href: '/users' },
  { text: 'การจอง', icon: <CalendarToday />, href: '/reservations' },
]

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function AppLayout({ children, title = 'Cool Cat Resort - ระบบจัดการ' }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
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
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 25%, #4f46e5 50%, #7c3aed 75%, #a855f7 100%)',
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
                  }}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 25%, #4f46e5 50%, #7c3aed 75%, #a855f7 100%)',
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
            <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
              {menuItems.map((item) => (
                <Link key={item.text} href={item.href} style={{ textDecoration: 'none' }}>
                  <Button
                    startIcon={item.icon}
                    sx={{
                      color: 'white',
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                </Link>
              ))}
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
           background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
           minHeight: 'calc(100vh - 200px)',
           maxHeight: 'calc(100vh - 200px)',
           borderRadius: '12px',
           boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
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