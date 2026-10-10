import { useState } from 'react'
import { Box, Button, Chip, IconButton, LinearProgress, ListItemIcon, Menu, MenuItem, Stack, Tooltip, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { CalendarDays, EllipsisVertical, MapPin, Pencil, Share2, Users, Wallet } from 'lucide'
import { destinations } from '../home/data'
import ImageWithFallback from '../layout/ImageWithFallback'
import LucideIcon from '../LucideIcon'
import { formatCurrency, type JourneyOverview } from '../journey/overview'

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const formatDate = (value: string) => dateFormatter.format(new Date(`${value}T00:00:00`))

type DashboardHeroProps = {
  overview: JourneyOverview
  onShare: () => void
  onEditPlan: () => void
  onChat?: () => void
}

export default function DashboardHero({ overview, onShare, onEditPlan, onChat }: DashboardHeroProps) {
  const { plan, budget, estimatedCost } = overview
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const remaining = budget - estimatedCost
  const used = Math.min(Math.round((estimatedCost / budget) * 100), 100)
  const country = destinations.find((item) => item.name.toLowerCase() === plan.destination.trim().toLowerCase())?.location
  const place = country ? `${plan.destination}, ${country}` : plan.destination
  const tone = remaining < 0 ? 'error' : 'success'

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '300px minmax(0, 1fr)', lg: '340px minmax(0, 1fr) 230px' },
        gap: { xs: 2, md: 2.5 },
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', aspectRatio: { xs: '16 / 9', md: '2 / 1' }, borderRadius: '10px', overflow: 'hidden' }}>
        <ImageWithFallback
          src={overview.coverImage?.src}
          alt={overview.coverImage?.alt ?? ''}
          label={`${plan.destination} · Image unavailable`}
        />
      </Box>
      <Stack spacing={1} sx={{ minWidth: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
          <Typography component="h1" sx={{ fontSize: { xs: 24, lg: 28 }, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2, overflowWrap: 'anywhere' }}>
            {overview.title}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            {onChat && (
              <Button variant="contained" onClick={onChat}>Ask AI</Button>
            )}
            <Button variant="outlined" onClick={onShare} startIcon={<LucideIcon node={Share2} />}>Share</Button>
            <Tooltip title="More actions">
              <IconButton
                aria-label="More actions"
                aria-haspopup="menu"
                onClick={(event) => setMenuAnchor(event.currentTarget)}
                sx={{ border: 1, borderColor: 'divider', borderRadius: '8px', bgcolor: 'background.paper', width: 40, height: 40 }}
              >
                <LucideIcon node={EllipsisVertical} />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => { setMenuAnchor(null); onEditPlan() }}>
                <ListItemIcon><LucideIcon node={Pencil} /></ListItemIcon>
                Edit plan
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, columnGap: 2.5, color: 'text.secondary' }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <LucideIcon node={MapPin} />
            <Typography variant="body2">{place}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <LucideIcon node={CalendarDays} />
            <Typography variant="body2">{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <LucideIcon node={Users} />
            <Typography variant="body2">{plan.travelers} {plan.travelers === 1 ? 'Traveler' : 'Travelers'}</Typography>
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '70ch' }}>{overview.summary}</Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, pt: 0.5 }}>
          {plan.interests.map((interest) => (
            <Chip key={interest} label={interest} variant="outlined" sx={{ borderRadius: '999px', bgcolor: 'background.paper' }} />
          ))}
        </Stack>
      </Stack>
      <Box
        sx={(theme) => ({
          gridColumn: { md: '1 / -1', lg: 'auto' },
          p: 2,
          borderRadius: '10px',
          bgcolor: alpha(theme.palette[tone].main, 0.07),
          border: `1px solid ${alpha(theme.palette[tone].main, 0.2)}`,
        })}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={(theme) => ({
              display: 'grid',
              placeItems: 'center',
              width: 40,
              height: 40,
              borderRadius: '8px',
              flexShrink: 0,
              color: 'common.white',
              bgcolor: theme.palette[tone].main,
            })}
          >
            <LucideIcon node={Wallet} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Estimated Budget</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: remaining < 0 ? 'error.main' : 'text.primary' }}>
              {formatCurrency(estimatedCost)}
            </Typography>
          </Box>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          for {plan.travelers} · {remaining < 0 ? `${formatCurrency(-remaining)} over` : `${formatCurrency(remaining)} left`} of {formatCurrency(budget)}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={used}
          color={tone}
          aria-label="Share of budget used by estimated cost"
          sx={{ mt: 0.75, height: 5 }}
        />
      </Box>
    </Box>
  )
}
