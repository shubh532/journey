import type { ReactNode } from 'react'
import { Paper, Stack, Typography } from '@mui/material'

type SectionCardProps = { title: string; action?: ReactNode; children: ReactNode }

export default function SectionCard({ title, action, children }: SectionCardProps) {
  return (
    <Paper component="section" variant="outlined" sx={{ p: { xs: 2, md: 2 } }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
        <Typography component="h2" sx={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</Typography>
        {action}
      </Stack>
      {children}
    </Paper>
  )
}
