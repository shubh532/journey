import { useState, type FormEvent } from 'react'
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router'
import { Box, Button, Container, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { ArrowLeft, Check, Sparkles } from 'lucide'
import LucideIcon from '../components/LucideIcon'
import AppHeader from '../components/layout/AppHeader'
import PageShell from '../components/layout/PageShell'
import { destinations, previewUser } from '../components/home/data'
import { readPlanState, validateStep, type JourneyPlan, type PlanErrors } from '../components/plan/model'
import {
  DestinationStep,
  DatesTravelersStep,
  TravelStyleStep,
  InterestsStep,
} from '../components/plan/PlanSteps'
import PlanSummary from '../components/plan/PlanSummary'
import motion from '../theme/motion.module.css'

const sections = [
  { title: 'Where are you going?', description: 'Choose where your journey starts and where you want to explore.', Component: DestinationStep },
  { title: 'When are you traveling?', description: "Choose your travel dates and who's coming along.", Component: DatesTravelersStep },
  { title: "What's your travel style?", description: "Set your budget and choose how you'd like to travel.", Component: TravelStyleStep },
  { title: 'What are you into?', description: "Select what you'd love to experience on this journey.", Component: InterestsStep },
]

const sectionIndexes = sections.map((_, index) => index)

export default function PlanJourneyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const restoredPlan = readPlanState(location.state)
  const [params] = useSearchParams()
  const [values, setValues] = useState<JourneyPlan>(() => {
    if (restoredPlan) return restoredPlan
    const requested = params.get('destination')?.trim().slice(0, 80) ?? ''
    const selected = destinations.find((item) => item.id === requested)
    return {
      origin: previewUser.location,
      destination: selected?.name || (selected ? '' : requested),
      startDate: '',
      endDate: '',
      travelers: selected?.persons || 2,
      tripType: 'Couple',
      budget: '',
      travelStyle: 'Balanced',
      interests: [],
    }
  })
  const [attempted, setAttempted] = useState(false)

  const sectionErrors = sectionIndexes.map((step) => validateStep(values, step))
  const completed = sectionErrors.map((errors) => !Object.keys(errors).length)
  const errors: PlanErrors = attempted ? Object.assign({}, ...sectionErrors) : {}

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const invalidStep = completed.indexOf(false)
    if (invalidStep !== -1) {
      setAttempted(true)
      const field = Object.keys(sectionErrors[invalidStep])[0]
      const form = event.currentTarget
      const target =
        form.querySelector<HTMLElement>(`[name="${field}"]`) ??
        form.querySelector<HTMLElement>(`#plan-section-${invalidStep}`)
      target?.focus()
      return
    }
    navigate('/plan/generating', {
      state: { plan: { ...values, origin: values.origin.trim(), destination: values.destination.trim() } },
    })
  }

  const completedCount = completed.filter(Boolean).length

  return (
    <PageShell>
      <title>Plan your journey | Journey</title>
      <AppHeader
        actions={<Button component={RouterLink} to="/home" startIcon={<LucideIcon node={ArrowLeft} />}>Home</Button>}
      />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, flex: 1 }}>
        <Box className={motion.fadeUp} sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography component="h1" variant="h3" sx={{ mb: 1 }}>Plan your journey</Typography>
          <Typography variant="subtitle1">Tell us what you're looking for, all in one place.</Typography>
        </Box>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Stack spacing={3}>
            {sections.map(({ title, description, Component }, index) => (
              <Paper
                key={title}
                component="section"
                variant="outlined"
                aria-labelledby={`plan-section-${index}`}
                className={motion.fadeUp}
                sx={{ p: { xs: 2.5, sm: 3.5 }, animationDelay: `${index * 60}ms` }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <Box
                    aria-hidden="true"
                    sx={(theme) => ({
                      display: 'grid',
                      placeItems: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                      color: completed[index] ? 'common.white' : 'primary.dark',
                      bgcolor: completed[index] ? 'success.main' : alpha(theme.palette.primary.main, 0.1),
                    })}
                  >
                    {completed[index] ? <LucideIcon node={Check} /> : index + 1}
                  </Box>
                  <Typography id={`plan-section-${index}`} tabIndex={-1} component="h2" variant="h5">
                    {title}
                  </Typography>
                </Stack>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 3, ml: { sm: 5 } }}>
                  {description}
                </Typography>
                <Component
                  values={values}
                  errors={errors}
                  onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
                />
              </Paper>
            ))}
          </Stack>
          <Paper
            component="aside"
            aria-label="Trip summary"
            variant="outlined"
            sx={{ p: 3, position: { md: 'sticky' }, top: { md: 104 } }}
          >
            <PlanSummary values={values} />
            <Box sx={{ mt: 3 }}>
              <Typography role="status" variant="body2" sx={{ mb: 1 }}>
                {completedCount} of {sections.length} sections complete
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(completedCount / sections.length) * 100}
                aria-label="Planning progress"
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              endIcon={<LucideIcon node={Sparkles} />}
            >
              Generate My Journey
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>
              You'll get a preview you can ask questions about.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </PageShell>
  )
}
