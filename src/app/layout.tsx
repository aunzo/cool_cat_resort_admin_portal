import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import SessionProviderWrapper from '../components/SessionProviderWrapper'
import theme from './theme'

const sarabun = Sarabun({ 
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'ครู แคท รีสอร์ท - ระบบหลังบ้าน',
  description: 'ระบบจัดการหลังบ้านสำหรับครู แคท รีสอร์ท',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={sarabun.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}