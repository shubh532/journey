import type { ReactNode } from 'react'
import { Paper, Stack, Typography } from '@mui/material'

type SectionCardProps = { title: string; action?: ReactNode; children: ReactNode }

export default function SectionCard({ title, action, children }: SectionCardProps) {
  return (
    <Paper component="section" variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
        <Typography component="h2" variant="h6">{title}</Typography>
        {action}
      </Stack>
      {children}
    </Paper>
  )
}
