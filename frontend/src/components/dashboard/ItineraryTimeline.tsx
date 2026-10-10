import { Box, Button, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { ArrowRight, ChevronRight, Hotel, MapPin, Plane, Star, Utensils, type IconNode } from 'lucide'
import ImageWithFallback from '../layout/ImageWithFallback'
import LucideIcon from '../LucideIcon'
import { dayDate, formatTime, type Activity, type ActivityKind } from './itinerary'

const kindIcons: Record<ActivityKind, { icon: IconNode; color: 'info' | 'primary' | 'warning' | 'success' }> = {
  travel: { icon: Plane, color: 'info' },
  stay: { icon: Hotel, color: 'primary' },
  food: { icon: Utensils, color: 'warning' },
  activity: { icon: Star, color: 'success' },
}

const dayFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

function Timeline({ items }: { items: Activity[] }) {
  return (
    <Stack component="ol" sx={{ listStyle: 'none', p: 0, m: 0 }}>
      {items.map((item, index) => {
        const last = index === items.length - 1
        const kind = kindIcons[item.kind]
        return (
          <Box component="li" key={item.id} sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 } }}>
            <Stack direction="row" sx={{ width: 84, pt: 0.25, flexShrink: 0, alignItems: 'flex-start', justifyContent: 'space-between', color: 'text.secondary' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap', fontSize: 13 }}>{formatTime(item.minutes)}</Typography>
              <Box sx={{ color: 'primary.main', display: 'flex', mt: 0.25 }}><LucideIcon node={ChevronRight} /></Box>
            </Stack>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={(theme) => ({
                  width: 12,
                  height: 12,
                  mt: 0.75,
                  borderRadius: '50%',
                  flexShrink: 0,
                  bgcolor: theme.palette.primary.main,
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}`,
                })}
              />
              {!last && <Box sx={{ width: '1px', flex: 1, mt: 0.5, bgcolor: 'divider' }} />}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, pb: last ? 0 : 2, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 15, overflowWrap: 'anywhere' }}>{item.title}</Typography>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                  <LucideIcon node={item.kind === 'travel' ? Plane : MapPin} />
                  <Typography variant="body2" sx={{ fontSize: 13, overflowWrap: 'anywhere' }}>{item.place}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontSize: 13 }}>{item.description}</Typography>
              </Box>
              <Box
                sx={(theme) => ({
                  display: { xs: 'none', sm: 'grid' },
                  placeItems: 'center',
                  width: 112,
                  height: 62,
                  flexShrink: 0,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  color: theme.palette[kind.color].main,
                  bgcolor: alpha(theme.palette[kind.color].main, 0.1),
                })}
              >
                {item.image ? (
                  <ImageWithFallback src={item.image} alt="" label="" />
                ) : (
                  <LucideIcon node={kind.icon} />
                )}
              </Box>
            </Box>
          </Box>
        )
      })}
    </Stack>
  )
}

type ItineraryTimelineProps = {
  items: Activity[]
  days: number
  startDate: string
  selectedDay: number
  onSelectDay: (day: number) => void
  onViewAll?: () => void
  showAllDays?: boolean
}

export default function ItineraryTimeline({
  items,
  days,
  startDate,
  selectedDay,
  onSelectDay,
  onViewAll,
  showAllDays = false,
}: ItineraryTimelineProps) {
  const dayNumbers = Array.from({ length: days }, (_, index) => index + 1)

  return (
    <Box component="section" aria-labelledby="itinerary-title">
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
        <Typography id="itinerary-title" component="h2" sx={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Itinerary
        </Typography>
        {onViewAll && (
          <Button onClick={onViewAll} endIcon={<LucideIcon node={ArrowRight} />} sx={{ minHeight: 32 }}>View full itinerary</Button>
        )}
      </Stack>
      <Stack
        direction="row"
        role="group"
        aria-label="Select a day"
        sx={{ gap: 1, mb: 2.5, overflowX: 'auto', pb: 0.5 }}
      >
        {dayNumbers.map((day) => {
          const selected = day === selectedDay
          return (
            <Button
              key={day}
              variant={selected ? 'contained' : 'outlined'}
              aria-pressed={selected}
              onClick={() => onSelectDay(day)}
              sx={{ flex: '1 0 76px', flexDirection: 'column', minHeight: 44, py: 0.5, lineHeight: 1.25 }}
            >
              <span>Day {day}</span>
              <Typography component="span" variant="caption" sx={{ color: 'inherit', opacity: 0.8 }}>
                {dayFormatter.format(dayDate(startDate, day))}
              </Typography>
            </Button>
          )
        })}
      </Stack>
      {showAllDays ? (
        <Stack spacing={3}>
          {dayNumbers.map((day) => (
            <Box key={day} component="section" aria-label={`Day ${day}`}>
              <Typography component="h3" variant="subtitle2" sx={{ mb: 1.5 }}>
                Day {day} · {dayFormatter.format(dayDate(startDate, day))}
              </Typography>
              <Timeline items={items.filter((item) => item.day === day)} />
            </Box>
          ))}
        </Stack>
      ) : (
        <Timeline items={items.filter((item) => item.day === selectedDay)} />
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        Sample plan: times and places are suggestions, not confirmed bookings. Changes you add here last for this session.
      </Typography>
    </Box>
  )
}
