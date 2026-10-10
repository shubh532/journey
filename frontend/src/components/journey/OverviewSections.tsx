import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { ArrowRight, CalendarDays, Compass, Plane, Sparkles, Star, Users } from 'lucide'
import LucideIcon from '../LucideIcon'
import ImageWithFallback from '../layout/ImageWithFallback'
import SectionCard from '../layout/SectionCard'
import { formatCurrency, type JourneyOverview } from './overview'
import type { WorkspaceTabId } from './workspace'

type SectionProps = { overview: JourneyOverview }
type NavigableSectionProps = SectionProps & { onNavigate: (tab: WorkspaceTabId) => void }

function LinkButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button onClick={onClick} endIcon={<LucideIcon node={ArrowRight} />} sx={{ flexShrink: 0 }}>
      {label}
    </Button>
  )
}

export function ItineraryPreview({ overview, onNavigate }: NavigableSectionProps) {
  const { itineraryPreview, hiddenDays } = overview

  return (
    <SectionCard title="Your Itinerary" action={<LinkButton label="View full itinerary" onClick={() => onNavigate('itinerary')} />}>
      <Stack component="ol" sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {itineraryPreview.map((item, index) => {
          const last = index === itineraryPreview.length - 1
          return (
            <Box component="li" key={item.day} sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={(theme) => ({
                    width: 12,
                    height: 12,
                    mt: 0.75,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    flexShrink: 0,
                    boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.14)}`,
                  })}
                />
                {!last && (
                  <Box
                    sx={(theme) => ({
                      width: 2,
                      flex: 1,
                      mt: 0.5,
                      borderRadius: 1,
                      backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.35)}, ${theme.palette.divider})`,
                    })}
                  />
                )}
              </Box>
              <Box sx={{ pb: last ? 0 : 2.5 }}>
                <Typography variant="caption" color="text.secondary">Day {item.day}</Typography>
                <Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{item.title}</Typography>
              </Box>
            </Box>
          )
        })}
      </Stack>
      {hiddenDays > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          + {hiddenDays} more {hiddenDays === 1 ? 'day' : 'days'} in the full itinerary
        </Typography>
      )}
    </SectionCard>
  )
}

export function FlightPreviewCard({ overview, onNavigate }: NavigableSectionProps) {
  const { flight } = overview
  const endpoint = (code: string, city: string, time: string, align: 'left' | 'right') => (
    <Box sx={{ textAlign: align, minWidth: 0 }}>
      <Typography variant="h5">{time}</Typography>
      <Typography sx={{ fontWeight: 600 }}>{code}</Typography>
      <Typography variant="body2" color="text.secondary" noWrap>{city}</Typography>
    </Box>
  )

  return (
    <SectionCard title="Recommended Flight" action={<LinkButton label="View flights" onClick={() => onNavigate('flights')} />}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{flight.airline}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
        {endpoint(flight.originCode, flight.originCity, flight.departure, 'left')}
        <Stack sx={{ alignItems: 'center', color: 'text.secondary' }}>
          <LucideIcon node={Plane} />
          <Typography variant="caption">{flight.duration}</Typography>
          <Typography variant="caption">{flight.stops}</Typography>
        </Stack>
        {endpoint(flight.destinationCode, flight.destinationCity, flight.arrival, 'right')}
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography>
        <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>{formatCurrency(flight.pricePerPerson)}</Box>
        {' '}/ person
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Estimated · {formatCurrency(flight.pricePerPerson * overview.plan.travelers)} for {overview.plan.travelers}{' '}
        {overview.plan.travelers === 1 ? 'traveler' : 'travelers'} · prices may change
      </Typography>
    </SectionCard>
  )
}

export function StayPreviewCard({ overview, onNavigate }: NavigableSectionProps) {
  const { hotel } = overview

  return (
    <SectionCard title="Your Stay" action={<LinkButton label="View hotels" onClick={() => onNavigate('hotels')} />}>
      <Box sx={{ aspectRatio: '16 / 9', borderRadius: 1, overflow: 'hidden', mb: 2 }}>
        <ImageWithFallback src={hotel.image} alt={hotel.imageAlt} label={`${hotel.name} · Image unavailable`} />
      </Box>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>{hotel.name}</Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }} aria-label={`Rated ${hotel.rating} out of 5, ${hotel.stars} star hotel`}>
          <LucideIcon node={Star} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{hotel.rating}</Typography>
        </Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{hotel.stars}-star · {hotel.area}</Typography>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, my: 2 }}>
        {hotel.amenities.map((amenity) => <Chip key={amenity} label={amenity} variant="outlined" />)}
      </Stack>
      <Typography>
        <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>{formatCurrency(hotel.pricePerNight)}</Box>
        {' '}/ night
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {formatCurrency(hotel.pricePerNight * hotel.nights)} estimated for {hotel.nights} {hotel.nights === 1 ? 'night' : 'nights'}
      </Typography>
    </SectionCard>
  )
}

export function TripSnapshot({ overview }: SectionProps) {
  const { plan, days } = overview
  const facts = [
    { icon: CalendarDays, label: `${days} ${days === 1 ? 'Day' : 'Days'}` },
    { icon: Users, label: `${plan.travelers} ${plan.travelers === 1 ? 'Traveler' : 'Travelers'} · ${plan.tripType}` },
    { icon: Compass, label: `${plan.travelStyle} travel` },
  ]

  return (
    <SectionCard title="Trip Snapshot">
      <Stack spacing={1.5}>
        {facts.map((fact) => (
          <Stack key={fact.label} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box sx={{ color: 'primary.main', display: 'flex' }}><LucideIcon node={fact.icon} /></Box>
            <Typography variant="body2">{fact.label}</Typography>
          </Stack>
        ))}
      </Stack>
    </SectionCard>
  )
}

const budgetColors = ['primary.dark', 'primary.main', 'primary.light', 'secondary.main', 'secondary.light']

export function BudgetSnapshot({ overview }: SectionProps) {
  const total = overview.budgetBreakdown.reduce((sum, item) => sum + item.amount, 0)

  return (
    <SectionCard title="Budget Snapshot">
      <Box
        role="img"
        aria-label="Budget split by category"
        sx={{ display: 'flex', height: 8, gap: '2px', borderRadius: 999, overflow: 'hidden', mb: 2.5 }}
      >
        {overview.budgetBreakdown.map((item, index) => (
          <Box
            key={item.label}
            sx={{ flex: total > 0 ? item.amount / total : 1, minWidth: 2, bgcolor: budgetColors[index % budgetColors.length] }}
          />
        ))}
      </Box>
      <Stack spacing={1.25} component="dl" sx={{ m: 0 }}>
        {overview.budgetBreakdown.map((item, index) => (
          <Stack key={item.label} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <Box aria-hidden="true" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: budgetColors[index % budgetColors.length] }} />
              <Typography component="dt" variant="body2" color="text.secondary">{item.label}</Typography>
            </Stack>
            <Typography component="dd" variant="body2" sx={{ m: 0 }}>{formatCurrency(item.amount)}</Typography>
          </Stack>
        ))}
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
        <Typography sx={{ fontWeight: 600 }}>Estimated</Typography>
        <Typography sx={{ fontWeight: 600, color: 'primary.dark' }}>{formatCurrency(overview.estimatedCost)}</Typography>
      </Stack>
    </SectionCard>
  )
}

export function PersonalizedInterests({ overview }: SectionProps) {
  return (
    <SectionCard title="Planned around what you love">
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
        {overview.plan.interests.map((interest) => (
          <Chip key={interest} label={interest} color="primary" variant="outlined" />
        ))}
      </Stack>
      <Stack
        direction="row"
        spacing={1.5}
        sx={(theme) => ({ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.06) })}
      >
        <Box sx={{ color: 'primary.main', display: 'flex', pt: 0.25 }}><LucideIcon node={Sparkles} /></Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Planned for you</Typography>
          <Typography variant="body2" color="text.secondary">{overview.summary}</Typography>
        </Box>
      </Stack>
    </SectionCard>
  )
}
