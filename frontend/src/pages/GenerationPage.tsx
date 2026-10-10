import {
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useEffect } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router'
import { ArrowLeft, Check, Circle, CircleCheck, LoaderCircle, Route, Sparkles } from 'lucide'
import LucideIcon from '../components/LucideIcon'
import EmptyState from '../components/layout/EmptyState'
import PageShell from '../components/layout/PageShell'
import Wordmark from '../components/layout/Wordmark'
import { readPlanState, type JourneyPlan } from '../components/plan/model'
import { generationStages, useGenerationPreview } from '../components/generation/useGenerationPreview'

function GenerationExperience({ plan }: { plan: JourneyPlan }) {
  const navigate = useNavigate()
  const { completedStages, progress, complete } = useGenerationPreview()

  useEffect(() => {
    if (!complete) return
    const timer = window.setTimeout(
      () => navigate('/journey/preview', { state: { plan }, replace: true }),
      1200,
    )
    return () => window.clearTimeout(timer)
  }, [complete, navigate, plan])
  const dateFormatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' })
  const budget = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(plan.budget))

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Box
          sx={(theme) => ({
            display: 'grid',
            placeItems: 'center',
            p: 2,
            borderRadius: '12px',
            color: 'primary.main',
            backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
          })}
        >
          <LucideIcon node={complete ? CircleCheck : Sparkles} />
        </Box>
        <Typography component="h1" variant="h4">
          {complete ? 'Your journey is ready' : 'Building your journey'}
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ overflowWrap: 'anywhere' }}>
          {complete
            ? 'Taking you to your trip...'
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
        {complete ? 'Journey ready — 100%' : `${progress}% complete · ${generationStages[completedStages].label}`}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        aria-label="Journey generation preview progress"
        sx={{
          '@media (prefers-reduced-motion: reduce)': {
            '& .MuiLinearProgress-bar': { transition: 'none' },
          },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        {complete ? 'This is a simulated journey. Nothing has been booked or saved.' : 'This preview takes just a few moments.'}
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
    <PageShell>
      <title>Building your journey | Journey</title>
      <Container component="main" maxWidth="sm" sx={{ py: { xs: 3, sm: 6 }, flex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Wordmark to="/home" />
        </Box>
        {plan ? (
          <GenerationExperience key={location.key} plan={plan} />
        ) : (
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <EmptyState
              headingComponent="h1"
              icon={Route}
              title="Let's plan your journey first"
              description="Your planning details aren't available. Complete the planner to preview generation."
              action={<Button component={RouterLink} to="/plan" variant="contained">Go to planning</Button>}
            />
          </Paper>
        )}
      </Container>
    </PageShell>
  )
}
