import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Link as RouterLink, useLocation } from 'react-router'
import { ArrowLeft, Check, Circle, CircleCheck, LoaderCircle, Sparkles } from 'lucide'
import LucideIcon from '../components/LucideIcon'
import { readPlanState, type JourneyPlan } from '../components/plan/model'
import { generationStages, useGenerationPreview } from '../components/generation/useGenerationPreview'

function GenerationExperience({ plan }: { plan: JourneyPlan }) {
  const { completedStages, progress, complete } = useGenerationPreview()
  const dateFormatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' })
  const budget = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(plan.budget))

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}>
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Box
          sx={(theme) => ({
            display: 'grid',
            placeItems: 'center',
            p: 2,
            borderRadius: 2,
            color: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          })}
        >
          <LucideIcon node={complete ? CircleCheck : Sparkles} />
        </Box>
        <Typography component="h1" variant="h4" sx={{ fontSize: { xs: '1.7rem', sm: '2rem' } }}>
          {complete ? 'Your journey is ready' : 'Building your journey'}
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ overflowWrap: 'anywhere' }}>
          {complete
            ? 'This preview is complete. Journey Overview will be implemented next.'
            : `We're creating a personalized trip to ${plan.destination} based on your preferences.`}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Simulated preview · No AI research or bookings are taking place.
        </Typography>
      </Stack>
      <Box sx={{ my: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
          {plan.origin} → {plan.destination}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {dateFormatter.format(new Date(`${plan.startDate}T00:00:00`))}
          {' – '}
          {dateFormatter.format(new Date(`${plan.endDate}T00:00:00`))}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {plan.travelers} {plan.travelers === 1 ? 'traveler' : 'travelers'} · {budget} budget
        </Typography>
      </Box>
      <Stack component="ol" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {generationStages.map((stage, index) => {
          const done = index < completedStages
          const active = index === completedStages && !complete
          const status = done ? 'Complete' : active ? 'In progress' : 'Pending'

          return (
            <Box
              component="li"
              key={stage.id}
              aria-label={`${stage.label}: ${status}`}
              aria-current={active ? 'step' : undefined}
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 1,
                bgcolor: active ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                color: done || active ? 'primary.dark' : 'text.secondary',
              })}
            >
              <Box
                sx={{
                  display: 'flex',
                  ...(active && {
                    animation: 'journey-spin 1.5s linear infinite',
                    '@keyframes journey-spin': { to: { transform: 'rotate(360deg)' } },
                  }),
                  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                }}
              >
                <LucideIcon node={done ? Check : active ? LoaderCircle : Circle} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: active ? 600 : 400 }}>
                {stage.label}
              </Typography>
            </Box>
          )
        })}
      </Stack>
      <Typography role="status" variant="body2" sx={{ mt: 3, mb: 1, textAlign: 'center' }}>
        {complete ? 'Preview complete — 100%' : `${progress}% complete · ${generationStages[completedStages].label}`}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        aria-label="Journey generation preview progress"
        sx={{
          height: 6,
          borderRadius: 1,
          '@media (prefers-reduced-motion: reduce)': {
            '& .MuiLinearProgress-bar': { transition: 'none' },
          },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        {complete ? 'No itinerary has been generated or saved.' : 'This preview takes just a few moments.'}
      </Typography>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button
          component={RouterLink}
          to="/plan"
          state={{ plan }}
          replace
          startIcon={<LucideIcon node={ArrowLeft} />}
        >
          Back to planning
        </Button>
      </Box>
    </Paper>
  )
}

export default function GenerationPage() {
  const location = useLocation()
  const plan = readPlanState(location.state)

  return (
    <Container component="main" maxWidth="sm" sx={{ py: { xs: 3, sm: 5 } }}>
      <title>Building your journey | Journey</title>
      <Typography variant="h5" sx={{ textAlign: 'center', color: 'primary.dark', fontWeight: 700, mb: 3 }}>
        Journey.
      </Typography>
      {plan ? (
        <GenerationExperience key={location.key} plan={plan} />
      ) : (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>Let's plan your journey first</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Your planning details aren't available. Complete the planner to preview generation.
          </Alert>
          <Button component={RouterLink} to="/plan" variant="contained">Go to planning</Button>
        </Paper>
      )}
    </Container>
  )
}
