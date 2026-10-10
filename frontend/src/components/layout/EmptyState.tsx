import type { ReactNode } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { IconNode } from 'lucide'
import LucideIcon from '../LucideIcon'

type EmptyStateProps = {
  icon: IconNode
  title: string
  description?: string
  action?: ReactNode
  headingComponent?: 'h1' | 'h2'
  role?: 'status'
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  headingComponent = 'h2',
  role,
}: EmptyStateProps) {
  return (
    <Stack role={role} spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', py: { xs: 5, md: 8 }, px: 2 }}>
      <Box
        sx={(theme) => ({
          width: 56,
          height: 56,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '12px',
          color: 'primary.main',
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
        })}
      >
        <LucideIcon node={icon} />
      </Box>
      <Typography component={headingComponent} variant="h6">{title}</Typography>
      {description && (
        <Typography color="text.secondary" sx={{ maxWidth: '42ch' }}>{description}</Typography>
      )}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  )
}
