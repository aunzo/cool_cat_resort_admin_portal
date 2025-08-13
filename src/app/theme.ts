'use client'
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea', // Soft blue-purple gradient start
      light: '#764ba2', // Gradient end
      dark: '#4c63d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f093fb', // Pink gradient start
      light: '#f5576c', // Gradient end
      dark: '#c471ed',
      contrastText: '#ffffff',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paper: 'rgba(255, 255, 255, 0.25)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.85)',
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
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          background: 'rgba(255, 255, 255, 0.35)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: '#ffffff',
           textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease',
          minHeight: 44,
          '&:hover': {
             background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(15px)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
          '@media (max-width:600px)': {
            minHeight: 48,
          },
        },
        contained: {
           background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
           backdropFilter: 'blur(20px)',
           border: '1px solid rgba(255, 255, 255, 0.3)',
           color: '#ffffff',
           textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
           '&:hover': {
             background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.35) 100%)',
           },
         },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: '#ffffff',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            },
            '&.Mui-focused': {
              background: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            },
            '@media (max-width:600px)': {
              minHeight: 48,
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.9)',
            '&.Mui-focused': {
              color: '#ffffff',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(5px)',
          borderRadius: '8px',
          margin: '4px 0',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          minHeight: 48,
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            transform: 'translateX(4px)',
          },
          '@media (max-width:600px)': {
            minHeight: 56,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          '@media (max-width:600px)': {
            padding: '8px 4px',
            fontSize: '0.875rem',
          },
        },
        head: {
          background: 'rgba(255, 255, 255, 0.35)',
          backdropFilter: 'blur(15px)',
          fontWeight: 600,
          color: '#ffffff',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(25px)',
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          },
          '@media (max-width:600px)': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
  },
})

export default theme