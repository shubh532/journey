import { useRef, useState, type FormEvent } from 'react'
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router'
import {
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide'
import LucideIcon from '../components/LucideIcon'
import { destinations, previewUser } from '../components/home/data'
import { readPlanState, stepLabels, validateStep, type JourneyPlan } from '../components/plan/model'
import {
  DestinationStep,
  DatesTravelersStep,
  TravelStyleStep,
  InterestsStep,
} from '../components/plan/PlanSteps'
import ReviewStep from '../components/plan/ReviewStep'
import AppHeader from '../components/layout/AppHeader'
import PageShell from '../components/layout/PageShell'
import motion from '../theme/motion.module.css'

const introductions = [
  ['Where are you going?', 'Choose where your journey starts and where you want to explore.'],
  ['When are you traveling?', "Choose your travel dates and who's coming along."],
  ["What's your travel style?", "Set your budget and choose how you'd like to travel."],
  ['What are you into?', "Select what you'd love to experience on this journey."],
  ['Ready for your journey?', 'Review your preferences before we build your trip.'],
]
const stepComponents = [DestinationStep, DatesTravelersStep, TravelStyleStep, InterestsStep]

export default function PlanJourneyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const restoredPlan = readPlanState(location.state)
  const [params] = useSearchParams()
  const [values, setValues] = useState<JourneyPlan>(() => {
    if (restoredPlan) return restoredPlan
    const selected = destinations.find((item) => item.id === params.get('destination'))
    return {
      origin: previewUser.location,
      destination: selected?.name || '',
      startDate: '',
      endDate: '',
      travelers: selected?.persons || 2,
      tripType: 'Couple',
      budget: '',
      travelStyle: 'Balanced',
      interests: [],
    }
  })
  const [activeStep, setActiveStep] = useState(restoredPlan ? 4 : 0)
  const [attempted, setAttempted] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const errors = attempted ? validateStep(values, activeStep) : {}
  const CurrentStep = stepComponents[activeStep]

  function changeStep(step: number) {
    setActiveStep(step)
    setAttempted(false)
    requestAnimationFrame(() => headingRef.current?.focus())
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = validateStep(values, activeStep)
    if (Object.keys(validation).length) {
      setAttempted(true)
      const field = Object.keys(validation)[0]
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus()
      return
    }
    if (activeStep < 4) {
      setValues((current) => ({
        ...current,
        origin: current.origin.trim(),
        destination: current.destination.trim(),
      }))
      changeStep(activeStep + 1)
    } else {
      const invalidStep = [0, 1, 2, 3].find(
        (step) => Object.keys(validateStep(values, step)).length,
      )
      if (invalidStep !== undefined) {
        changeStep(invalidStep)
        setAttempted(true)
      } else {
        navigate('/plan/generating', { state: { plan: values } })
      }
    }
  }

  return (
    <PageShell>
      <title>Plan your journey | Journey</title>
      <AppHeader
        maxWidth="md"
        actions={<Button component={RouterLink} to="/home" startIcon={<LucideIcon node={ArrowLeft} />}>Home</Button>}
      />
      <Container component="main" maxWidth="md" sx={{ py: { xs: 3, md: 5 }, flex: 1 }}>
        <Typography component="h1" variant="h3" sx={{ mb: 1 }}>Plan your journey</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Tell us what you're looking for.</Typography>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ display: { xs: 'none', md: 'flex' }, mb: 4 }}>
          {stepLabels.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Step {activeStep + 1} of 5 · {stepLabels[activeStep]}</Typography>
          <LinearProgress variant="determinate" value={(activeStep + 1) * 20} aria-label="Planning progress" />
        </Box>
        <Paper
          component="form"
          variant="outlined"
          noValidate
          onSubmit={handleSubmit}
          sx={{ p: { xs: 2.5, sm: 4 } }}
        >
          <Box key={activeStep} className={motion.fadeUp}>
            <Typography
              ref={headingRef}
              tabIndex={-1}
              component="h2"
              variant="h5"
              sx={{ mb: 1, '&:focus': { outlineColor: 'primary.main' } }}
            >
              {introductions[activeStep][0]}
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>{introductions[activeStep][1]}</Typography>
            {activeStep === 4 ? (
              <ReviewStep values={values} onEdit={changeStep} />
            ) : (
              <CurrentStep
                values={values}
                errors={errors}
                onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
              />
            )}
          </Box>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              mt: 4,
              pt: 3,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            {activeStep > 0 && (
              <Button type="button" onClick={() => changeStep(activeStep - 1)} startIcon={<LucideIcon node={ArrowLeft} />}>Back</Button>
            )}
            <Button
              type="submit"
              variant="contained"
              sx={{ ml: 'auto' }}
              endIcon={<LucideIcon node={activeStep === 4 ? Sparkles : ArrowRight} />}
            >
              {activeStep === 4 ? 'Generate My Journey' : 'Continue'}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </PageShell>
  )
}
