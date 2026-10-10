import { Box, ButtonBase, Typography } from '@mui/material'
import ImageWithFallback from '../layout/ImageWithFallback'
import { destinations } from './data'
import type { PlaceTile } from './exploreData'

const hue = (name: string) => [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360

type PlaceTilesProps = { items: PlaceTile[]; onPick: (name: string) => void }

export default function PlaceTiles({ items, onPick }: PlaceTilesProps) {
  return (
    <Box
      component="ul"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))' },
        gap: 1.25,
        listStyle: 'none',
        p: 0,
        m: 0,
      }}
    >
      {items.map((place) => {
        const source = destinations.find((destination) => destination.id === place.imageFrom)
        return (
          <Box component="li" key={place.name}>
            <ButtonBase
              onClick={() => onPick(place.name)}
              aria-label={`Plan a trip to ${place.name}`}
              sx={(theme) => ({
                display: 'block',
                position: 'relative',
                width: '100%',
                aspectRatio: '8 / 7',
                overflow: 'hidden',
                borderRadius: '8px',
                textAlign: 'left',
                boxShadow: theme.shadows[1],
                '& img': { transition: theme.transitions.create('transform', { duration: 500 }) },
                '@media (hover: hover)': { '&:hover img': { transform: 'scale(1.06)' } },
                '@media (prefers-reduced-motion: reduce)': { '& img': { transition: 'none' }, '&:hover img': { transform: 'none' } },
              })}
            >
              {source ? (
                <ImageWithFallback src={source.image} alt="" label="" />
              ) : (
                <Box
                  aria-hidden="true"
                  sx={{
                    height: '100%',
                    backgroundImage: `linear-gradient(135deg, hsl(${hue(place.name)} 45% 42%), hsl(${(hue(place.name) + 40) % 360} 50% 28%))`,
                  }}
                />
              )}
              <Box
                aria-hidden="true"
                sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 45%, rgba(15,23,42,0.7) 100%)' }}
              />
              <Typography
                sx={{ position: 'absolute', left: 10, right: 8, bottom: 8, fontWeight: 700, fontSize: 14, color: 'common.white', lineHeight: 1.2 }}
              >
                {place.name}
              </Typography>
            </ButtonBase>
          </Box>
        )
      })}
    </Box>
  )
}
