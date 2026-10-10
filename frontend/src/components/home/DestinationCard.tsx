import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material'
import { ArrowRight, MapPin } from 'lucide'
import { alpha } from '@mui/material/styles'
import ImageWithFallback from '../layout/ImageWithFallback'
import LucideIcon from '../LucideIcon'
import type { Destination } from './data'

const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

type DestinationCardProps = {
  destination: Destination
  onPlan: (destination: Destination) => void
}

export default function DestinationCard({
  destination,
  onPlan,
}: DestinationCardProps) {
  return (
    <Card
      component="article"
      variant="outlined"
      sx={(theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderColor: 'divider',
        transition: theme.transitions.create(['transform', 'box-shadow', 'border-color']),
        '& img': {
          transition: theme.transitions.create('transform', { duration: 500 }),
        },
        '@media (hover: hover) and (pointer: fine)': {
          '&:hover': {
            transform: 'translateY(-3px)',
            borderColor: alpha(theme.palette.primary.main, 0.3),
            boxShadow: theme.shadows[4],
            '& img': { transform: 'scale(1.04)' },
          },
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '& img': { transition: 'none' },
          '&:hover': { transform: 'none', '& img': { transform: 'none' } },
        },
      })}
    >
      <Box sx={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden' }}>
        <ImageWithFallback
          src={destination.image}
          alt={destination.imageAlt}
          label={`${destination.name} · Image unavailable`}
        />
        <Chip
          icon={<LucideIcon node={MapPin} />}
          label={destination.location}
          sx={(theme) => ({
            position: 'absolute',
            left: 12,
            bottom: 12,
            bgcolor: alpha(theme.palette.background.paper, 0.88),
            color: 'text.primary',
            backdropFilter: 'blur(8px)',
            boxShadow: theme.shadows[1],
            '& .MuiChip-icon': { color: 'primary.main', ml: 1 },
          })}
        />
      </Box>
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography component="h2" variant="h6">
          {destination.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3, flex: 1 }}>
          {destination.summary}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Sample package
            </Typography>
            <Typography variant="h6" sx={{ color: 'primary.dark' }}>
              {priceFormatter.format(destination.packagePrice)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {destination.days} Days · {destination.nights} Nights
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              For {destination.persons} {destination.persons === 1 ? 'person' : 'people'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => onPlan(destination)}
            aria-label={`Plan Trip to ${destination.name}`}
            endIcon={<LucideIcon node={ArrowRight} />}
            sx={{ ml: 'auto', flexShrink: 0 }}
          >
            Plan Trip
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
