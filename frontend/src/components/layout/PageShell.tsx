import type { ReactNode } from 'react'
import { Box } from '@mui/material'

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      {children}
    </Box>
  )
}
