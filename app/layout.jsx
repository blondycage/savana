'use client';

import './globals.css'
import { ThemeProvider } from '@/lib/context/ThemeContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
