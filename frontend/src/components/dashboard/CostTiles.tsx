import { Box, Paper, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Bus, Hotel, Plane, Star, Utensils, type IconNode } from 'lucide'
import LucideIcon from '../LucideIcon'
import { formatCurrency, type JourneyOverview } from '../journey/overview'

type Tone = 'error' | 'primary' | 'warning' | 'success' | 'secondary'

const tiles: Record<string, { icon: IconNode; tone: Tone }> = {
  Flights: { icon: Plane, tone: 'error' },
  Stay: { icon: Hotel, tone: 'primary' },
  Food: { icon: Utensils, tone: 'warning' },
  Activities: { icon: Star, tone: 'success' },
  'Local travel': { icon: Bus, tone: 'secondary' },
}

type CostTilesProps = { overview: JourneyOverview; limit?: number }

export default function CostTiles({ overview, limit }: CostTilesProps) {
  const { plan, hotel } = overview
  const notes: Record<string, string> = {
    Flights: `${plan.travelers} ${plan.travelers === 1 ? 'traveler' : 'travelers'}`,
    Stay: `${hotel.nights} ${hotel.nights === 1 ? 'night' : 'nights'}`,
  }

  return (
    <Box component="section" aria-labelledby="trip-overview-title">
      <Typography id="trip-overview-title" component="h2" sx={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', mb: 1.5 }}>
        Trip Overview
      </Typography>
      <Box
        component="ul"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))',
          gap: 1.25,
          listStyle: 'none',
          p: 0,
          m: 0,
        }}
      >
        {overview.budgetBreakdown.slice(0, limit).map((item) => {
          const tile = tiles[item.label] ?? { icon: Star, tone: 'primary' as Tone }
          return (
            <Paper key={item.label} component="li" variant="outlined" sx={{ p: 1.5, boxShadow: 'none', bgcolor: 'background.paper' }}>
              <Box
                sx={(theme) => ({
                  display: 'grid',
                  placeItems: 'center',
                  width: 32,
                  height: 32,
                  mb: 1,
                  borderRadius: '8px',
                  color: theme.palette[tile.tone].main,
                  bgcolor: alpha(theme.palette[tile.tone].main, 0.12),
                })}
              >
                <LucideIcon node={tile.icon} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>{item.label}</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{formatCurrency(item.amount)}</Typography>
              <Typography variant="caption" color="text.secondary">{notes[item.label] ?? 'Estimated'}</Typography>
            </Paper>
          )
        })}
      </Box>
    </Box>
  )
}
