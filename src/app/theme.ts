'use client'
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1995AD',
    },
    secondary: {
      main: '#A1D6E2',
    },
    background: {
      default: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Sarabun, Arial, sans-serif',
    // Responsive typography
    h4: {
      fontSize: '1.75rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.125rem',
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          // Better touch targets for mobile
          minHeight: 44,
          '@media (max-width:600px)': {
            minHeight: 48,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          // Better touch targets for mobile inputs
          '& .MuiInputBase-root': {
            '@media (max-width:600px)': {
              minHeight: 48,
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          // Better touch targets for navigation
          minHeight: 48,
          '@media (max-width:600px)': {
            minHeight: 56,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          // Better spacing for mobile tables
          '@media (max-width:600px)': {
            padding: '8px 4px',
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          // Better mobile card styling
          '@media (max-width:600px)': {
            borderRadius: 8,
          },
        },
      },
    },
  },
})

export default theme