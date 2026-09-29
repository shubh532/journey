import { useRef, useState, type FormEvent } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router'
import {
  Alert,
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
import { stepLabels, validateStep, type JourneyPlan } from '../components/plan/model'
import {
  DestinationStep,
  DatesTravelersStep,
  TravelStyleStep,
  InterestsStep,
} from '../components/plan/PlanSteps'
import ReviewStep from '../components/plan/ReviewStep'

const introductions = [
  ['Where are you going?', 'Choose where your journey starts and where you want to explore.'],
  ['When are you traveling?', "Choose your travel dates and who's coming along."],
  ["What's your travel style?", "Set your budget and choose how you'd like to travel."],
  ['What are you into?', "Select what you'd love to experience on this journey."],
  ['Ready for your journey?', 'Review your preferences before we build your trip.'],
]
const stepComponents = [DestinationStep, DatesTravelersStep, TravelStyleStep, InterestsStep]

export default function PlanJourneyPage() {
  const [params] = useSearchParams()
  const [values, setValues] = useState<JourneyPlan>(() => {
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
  const [activeStep, setActiveStep] = useState(0)
  const [attempted, setAttempted] = useState(false)
  const [generated, setGenerated] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const errors = attempted ? validateStep(values, activeStep) : {}
  const CurrentStep = stepComponents[activeStep]

  function changeStep(step: number) {
    setActiveStep(step)
    setAttempted(false)
    setGenerated(false)
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
        setGenerated(true)
      }
    }
  }

  return (
    <Box sx={{ minHeight: '100svh' }}>
      <title>Plan your journey | Journey</title>
      <Box component="header" sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="md" sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ color: 'primary.dark', fontWeight: 700 }}>Journey.</Typography>
          <Button component={RouterLink} to="/home" startIcon={<LucideIcon node={ArrowLeft} />}>Home</Button>
        </Container>
      </Box>
      <Container component="main" maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography component="h1" variant="h4" sx={{ mb: 1 }}>Plan your journey</Typography>
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
          sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}
        >
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
          {generated && (
            <Alert severity="info" role="status" sx={{ mt: 3 }}>
              Your preferences are ready. Journey generation isn't connected yet. No trip has been generated or saved.
            </Alert>
          )}
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
              sx={{ ml: 'auto', minHeight: 44 }}
              endIcon={<LucideIcon node={activeStep === 4 ? Sparkles : ArrowRight} />}
            >
              {activeStep === 4 ? 'Generate My Journey' : 'Continue'}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
