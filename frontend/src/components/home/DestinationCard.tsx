import { useState } from 'react'
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { ArrowRight, MapPin } from 'lucide'
import { alpha } from '@mui/material/styles'
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
  const [imageFailed, setImageFailed] = useState(false)

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
          transition: theme.transitions.create('transform', { duration: 350 }),
        },
        '@media (hover: hover) and (pointer: fine)': {
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: alpha(theme.palette.primary.main, 0.25),
            boxShadow: theme.shadows[3],
            '& img': { transform: 'scale(1.03)' },
          },
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '& img': { transition: 'none' },
          '&:hover': { transform: 'none', '& img': { transform: 'none' } },
        },
      })}
    >
      <Box sx={{ aspectRatio: '4 / 3', bgcolor: 'action.hover', overflow: 'hidden' }}>
        {imageFailed ? (
          <Stack
            spacing={1}
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <LucideIcon node={MapPin} />
            <Typography variant="body2">{destination.name} · Image unavailable</Typography>
          </Stack>
        ) : (
          <Box
            component="img"
            src={destination.image}
            alt={destination.imageAlt}
            loading="lazy"
            onError={() => setImageFailed(true)}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </Box>
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
        >
          <Typography component="h2" variant="h6" sx={{ fontWeight: 600 }}>
            {destination.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
            {destination.location}
          </Typography>
        </Stack>
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
            sx={{ ml: 'auto', flexShrink: 0, minHeight: 44 }}
          >
            Plan Trip
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

