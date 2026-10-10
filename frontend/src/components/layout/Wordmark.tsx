import { Box, Typography } from '@mui/material'
import { Mountain } from 'lucide'
import { Link as RouterLink } from 'react-router'
import { brandGradient } from '../../theme/tokens'
import LucideIcon from '../LucideIcon'

type WordmarkProps = { to?: string; size?: 'md' | 'lg'; light?: boolean }

export default function Wordmark({ to, size = 'md', light = false }: WordmarkProps) {
  const content = (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <Box
        component="span"
        aria-hidden="true"
        sx={(theme) => ({
          display: 'grid',
          placeItems: 'center',
          width: size === 'lg' ? 36 : 30,
          height: size === 'lg' ? 36 : 30,
          borderRadius: '8px',
          color: light ? 'primary.dark' : 'common.white',
          ...(light ? { bgcolor: 'common.white' } : { backgroundImage: brandGradient(theme) }),
        })}
      >
        <LucideIcon node={Mountain} />
      </Box>
      <Typography
        component="span"
        variant={size === 'lg' ? 'h4' : 'h5'}
        sx={{ color: light ? 'common.white' : 'text.primary', fontWeight: 700, letterSpacing: '-0.03em' }}
      >
        Journey
      </Typography>
    </Box>
  )

  if (!to) return content

  return (
    <Box
      component={RouterLink}
      to={to}
      aria-label="Journey home"
      sx={{ color: 'inherit', textDecoration: 'none', borderRadius: '8px', display: 'inline-flex' }}
    >
      {content}
    </Box>
  )
}
