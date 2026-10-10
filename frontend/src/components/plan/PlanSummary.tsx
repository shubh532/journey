import { Box, Chip, Stack, Typography } from '@mui/material'
import type { JourneyPlan } from './model'

const dateFormatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' })
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const formatDate = (value: string) => dateFormatter.format(new Date(`${value}T00:00:00`))

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <Box component="div">
      <Typography component="dt" variant="caption" color="text.secondary">{label}</Typography>
      <Typography component="dd" sx={{ m: 0, overflowWrap: 'anywhere', color: value ? 'text.primary' : 'text.secondary' }}>
        {value || 'Not set yet'}
      </Typography>
    </Box>
  )
}

export default function PlanSummary({ values }: { values: JourneyPlan }) {
  const origin = values.origin.trim()
  const destination = values.destination.trim()
  const budget = Number(values.budget)
  const hasDates = values.startDate && values.endDate

  return (
    <>
      <Typography component="h2" variant="overline" color="primary.main">Your trip</Typography>
      <Stack component="dl" spacing={2} sx={{ m: 0, mt: 1.5 }}>
        <Row label="Route" value={origin && destination ? `${origin} → ${destination}` : undefined} />
        <Row
          label="Dates"
          value={hasDates ? `${formatDate(values.startDate)} – ${formatDate(values.endDate)}` : undefined}
        />
        <Row
          label="Travelers"
          value={`${values.travelers} ${values.travelers === 1 ? 'traveler' : 'travelers'} · ${values.tripType}`}
        />
        <Row
          label="Budget"
          value={Number.isFinite(budget) && budget > 0 ? `${currencyFormatter.format(budget)} · ${values.travelStyle}` : undefined}
        />
        <Box component="div">
          <Typography component="dt" variant="caption" color="text.secondary">Interests</Typography>
          <Box component="dd" sx={{ m: 0, mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {values.interests.length ? (
              values.interests.map((interest) => <Chip key={interest} label={interest} />)
            ) : (
              <Typography color="text.secondary">Not set yet</Typography>
            )}
          </Box>
        </Box>
      </Stack>
    </>
  )
}
