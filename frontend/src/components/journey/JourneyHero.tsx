import { Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import { CalendarDays, Share2, Sparkles, Users } from 'lucide'
import LucideIcon from '../LucideIcon'
import ImageWithFallback from '../layout/ImageWithFallback'
import { formatCurrency, type JourneyOverview } from './overview'

const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' })
const formatDate = (value: string) => dateFormatter.format(new Date(`${value}T00:00:00`))

type JourneyHeroProps = {
  overview: JourneyOverview
  onModify: () => void
  onShare: () => void
}

export default function JourneyHero({ overview, onModify, onShare }: JourneyHeroProps) {
  const { plan, budget, estimatedCost } = overview
  const remaining = budget - estimatedCost
  const used = Math.min(Math.round((estimatedCost / budget) * 100), 100)

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2.5 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 2fr) minmax(0, 3fr)' } }}>
        <Box sx={{ aspectRatio: { xs: '16 / 9', md: 'auto' }, minHeight: { md: 280 } }}>
          <ImageWithFallback
            src={overview.coverImage?.src}
            alt={overview.coverImage?.alt ?? ''}
            label={`${plan.destination} · Image unavailable`}
          />
        </Box>
        <Stack spacing={2.5} sx={{ p: { xs: 2.5, md: 4 }, justifyContent: 'center' }}>
          <Chip
            icon={<LucideIcon node={Sparkles} />}
            label="AI Planned"
            color="primary"
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          />
          <Box>
            <Typography component="h1" variant="h3" sx={{ overflowWrap: 'anywhere' }}>
              {overview.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
              {plan.origin} → {plan.destination}
            </Typography>
          </Box>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, columnGap: 3, color: 'text.secondary' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <LucideIcon node={CalendarDays} />
              <Typography variant="body2">
                {formatDate(plan.startDate)} – {formatDate(plan.endDate)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <LucideIcon node={Users} />
              <Typography variant="body2">
                {plan.travelers} {plan.travelers === 1 ? 'Traveler' : 'Travelers'} · {plan.tripType} · {plan.travelStyle}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.5 }}>
            <Button variant="contained" onClick={onModify} startIcon={<LucideIcon node={Sparkles} />}>
              Modify Journey
            </Button>
            <Button variant="outlined" onClick={onShare} startIcon={<LucideIcon node={Share2} />}>
              Share
            </Button>
          </Stack>
        </Stack>
      </Box>
      <Box sx={{ p: { xs: 2.5, md: 3 }, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Estimated Trip Cost</Typography>
            <Typography variant="h6" sx={{ color: 'primary.dark' }}>{formatCurrency(estimatedCost)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Your Budget</Typography>
            <Typography variant="h6">{formatCurrency(budget)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">{remaining < 0 ? 'Over budget' : 'Remaining'}</Typography>
            <Typography variant="h6" sx={{ color: remaining < 0 ? 'error.main' : 'text.primary' }}>
              {formatCurrency(Math.abs(remaining))}
            </Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={used}
          color={remaining < 0 ? 'error' : 'primary'}
          aria-label="Share of budget used by estimated cost"
          sx={{ mt: 2 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {formatCurrency(estimatedCost)} of {formatCurrency(budget)} · {used}% of budget used · estimated, not a booking price
        </Typography>
      </Box>
    </Paper>
  )
}

