import { Box, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'

type WordmarkProps = { to?: string; size?: 'md' | 'lg'; light?: boolean }

export default function Wordmark({ to, size = 'md', light = false }: WordmarkProps) {
  const content = (
    <Typography
      component="span"
      variant={size === 'lg' ? 'h4' : 'h5'}
      sx={{ color: light ? 'common.white' : 'primary.dark', fontWeight: 700, letterSpacing: '-0.04em' }}
    >
      Journey
      <Box component="span" sx={{ color: light ? 'secondary.light' : 'secondary.main' }}>.</Box>
    </Typography>
  )

  if (!to) return content

  return (
    <Box
      component={RouterLink}
      to={to}
      aria-label="Journey home"
      sx={{ color: 'inherit', textDecoration: 'none', borderRadius: 1, display: 'inline-flex' }}
    >
      {content}
    </Box>
  )
}
