import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import { Box, Chip, Paper, Typography } from '@mui/material'
import { toApiError } from '../../services/apiError'
import { journeyApi, type JourneyDto } from '../../services/journeyApi'
import { formatCurrency } from '../journey/overview'
import SectionHeading from './SectionHeading'

type LoadResult = { journeys?: JourneyDto[]; error?: string }

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const formatDate = (value: string) => dateFormatter.format(new Date(`${value}T00:00:00`))

export default function MyJourneys({ sx }: { sx?: object }) {
  const [result, setResult] = useState<LoadResult | null>(null)

  useEffect(() => {
    let active = true
    journeyApi
      .list()
      .then((journeys) => active && setResult({ journeys }))
      .catch((error: unknown) => active && setResult({ error: toApiError(error).message }))
    return () => {
      active = false
    }
  }, [])

  if (!result) return null
  if (result.error) {
    return (
      <Typography role="status" variant="body2" color="text.secondary" sx={sx}>
        We couldn't load your journeys.
      </Typography>
    )
  }
  if (!result.journeys?.length) return null

  return (
    <Box component="section" aria-labelledby="my-journeys-title" sx={sx}>
      <SectionHeading id="my-journeys-title" title="Your Journeys" subtitle="Pick up where you left off" />
      <Box
        component="ul"
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2, listStyle: 'none', p: 0, m: 0 }}
      >
        {result.journeys.map((journey) => (
          <Box component="li" key={journey.id}>
            <Paper
              component={RouterLink}
              to={`/journey/${journey.id}`}
              variant="outlined"
              sx={{ display: 'block', p: 2, height: '100%', color: 'inherit', textDecoration: 'none', '&:hover, &:focus-visible': { borderColor: 'primary.main' } }}
            >
              <Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{journey.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {journey.origin} → {journey.destination}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(journey.startDate)} – {formatDate(journey.endDate)} · {journey.travelers}{' '}
                {journey.travelers === 1 ? 'traveler' : 'travelers'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {journey.estimatedCost === undefined ? formatCurrency(journey.budget) : formatCurrency(journey.estimatedCost)}
                  <Typography component="span" variant="caption" color="text.secondary">
                    {journey.estimatedCost === undefined ? ' budget' : ' estimated'}
                  </Typography>
                </Typography>
                {journey.status !== 'READY' && <Chip size="small" label={journey.status.toLowerCase()} />}
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
