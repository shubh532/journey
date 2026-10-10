import { Box, ButtonBase, Chip, IconButton, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Heart, MapPin } from 'lucide'
import ImageWithFallback from '../layout/ImageWithFallback'
import LucideIcon from '../LucideIcon'
import type { Destination } from './data'

type PopularDestinationsProps = {
  items: Destination[]
  favorites: string[]
  onToggleFavorite: (id: string) => void
  onPlan: (destination: Destination) => void
}

export default function PopularDestinations({ items, favorites, onToggleFavorite, onPlan }: PopularDestinationsProps) {
  return (
    <Box
      component="ul"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
        gap: 2.5,
        listStyle: 'none',
        p: 0,
        m: 0,
      }}
    >
      {items.map((destination) => {
        const liked = favorites.includes(destination.id)
        return (
          <Box component="li" key={destination.id} sx={{ position: 'relative' }}>
            <ButtonBase
              onClick={() => onPlan(destination)}
              aria-label={`Plan a trip to ${destination.name}`}
              sx={(theme) => ({
                display: 'block',
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 10',
                overflow: 'hidden',
                borderRadius: '10px',
                textAlign: 'left',
                boxShadow: theme.shadows[2],
                '& img': { transition: theme.transitions.create('transform', { duration: 500 }) },
                '@media (hover: hover)': { '&:hover img': { transform: 'scale(1.05)' } },
                '@media (prefers-reduced-motion: reduce)': { '& img': { transition: 'none' }, '&:hover img': { transform: 'none' } },
              })}
            >
              <ImageWithFallback src={destination.image} alt={destination.imageAlt} label={`${destination.name} · Image unavailable`} />
              <Box
                aria-hidden="true"
                sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(15,23,42,0.78) 100%)' }}
              />
              <Box sx={{ position: 'absolute', left: 16, right: 16, bottom: 14 }}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'common.white', mb: 0.75 }}>
                  <LucideIcon node={MapPin} />
                  <Typography sx={{ fontWeight: 700, fontSize: 18, color: 'inherit' }}>{destination.name}</Typography>
                </Stack>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  {destination.tags.slice(0, 3).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      sx={(theme) => ({ height: 26, fontSize: 12, bgcolor: alpha(theme.palette.common.white, 0.92), color: 'text.primary' })}
                    />
                  ))}
                </Stack>
              </Box>
            </ButtonBase>
            <IconButton
              aria-label={liked ? `Remove ${destination.name} from favourites` : `Add ${destination.name} to favourites`}
              aria-pressed={liked}
              onClick={() => onToggleFavorite(destination.id)}
              sx={(theme) => ({
                position: 'absolute',
                top: 12,
                right: 12,
                width: 34,
                height: 34,
                color: liked ? theme.palette.error.main : theme.palette.common.white,
                bgcolor: alpha(theme.palette.common.black, 0.3),
                backdropFilter: 'blur(6px)',
                '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.45) },
                '& svg': { fill: liked ? theme.palette.error.main : 'none' },
                '@media (pointer: coarse)': { width: 44, height: 44 },
              })}
            >
              <LucideIcon node={Heart} />
            </IconButton>
          </Box>
        )
      })}
    </Box>
  )
}
