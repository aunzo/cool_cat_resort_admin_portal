'use client'
import React from 'react'
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material'
import { styled } from '@mui/material/styles'

// Extended Button props interface
export interface ButtonProps extends MuiButtonProps {
  loading?: boolean
  loadingText?: string
}

// Styled Button with custom styling
const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 500,
  padding: theme.spacing(1, 2),
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
  },
  
  '&.MuiButton-contained': {
    background: '#1995AD',
    color: 'white',
    '&:hover': {
      background: '#147a8f',
    },
  },
  
  '&.MuiButton-outlined': {
    borderColor: '#1995AD',
    color: '#1995AD',
    '&:hover': {
      borderColor: '#147a8f',
      backgroundColor: 'rgba(25, 149, 173, 0.04)',
    },
  },
  
  '&.MuiButton-text': {
    color: '#1995AD',
    '&:hover': {
      backgroundColor: 'rgba(25, 149, 173, 0.04)',
    },
  },
  
  '&:disabled': {
    transform: 'none',
    boxShadow: 'none',
  },
}))

// Custom Button component
const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  loadingText = 'Loading...',
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      {...props}
      disabled={disabled || loading}
    >
      {loading ? loadingText : children}
    </StyledButton>
  )
}

export default Button