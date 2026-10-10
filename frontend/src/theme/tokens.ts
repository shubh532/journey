import { alpha, type Theme } from '@mui/material/styles'

export const radii = { control: 10, card: 16, hero: 20 } as const

export const brandGradient = (theme: Theme) =>
  `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.secondary.main} 100%)`

export const glassSurface = (theme: Theme) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.78),
  backdropFilter: 'blur(16px) saturate(160%)',
  WebkitBackdropFilter: 'blur(16px) saturate(160%)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.7)}`,
  boxShadow: `${theme.shadows[3]}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.9)}`,
})

export const elevatedSurface = (theme: Theme) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: `${radii.card}px`,
  boxShadow: `${theme.shadows[2]}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.9)}`,
})
