export const tripTypes = ['Solo', 'Couple', 'Family', 'Friends'] as const
export const travelStyles = [
  { label: 'Budget', description: 'Make the most of every rupee' },
  { label: 'Balanced', description: 'Comfort and value in the right mix' },
  { label: 'Luxury', description: 'Premium stays and experiences' },
] as const
export const interests = ['Adventure', 'Nature', 'Food', 'Beaches', 'Culture', 'Nightlife', 'Shopping', 'Relaxation'] as const

export type JourneyPlan = {
  origin: string
  destination: string
  startDate: string
  endDate: string
  travelers: number
  tripType: (typeof tripTypes)[number]
  budget: string
  travelStyle: (typeof travelStyles)[number]['label']
  interests: string[]
}
export type PlanErrors = Partial<Record<keyof JourneyPlan, string>>

export function readPlanState(state: unknown): JourneyPlan | null {
  if (!state || typeof state !== 'object' || !('plan' in state)) return null
  const plan = state.plan
  if (!plan || typeof plan !== 'object') return null
  const value = plan as Partial<JourneyPlan>
  if (
    typeof value.origin !== 'string' ||
    typeof value.destination !== 'string' ||
    typeof value.startDate !== 'string' ||
    typeof value.endDate !== 'string' ||
    !Number.isFinite(Date.parse(`${value.startDate}T00:00:00`)) ||
    !Number.isFinite(Date.parse(`${value.endDate}T00:00:00`)) ||
    typeof value.travelers !== 'number' ||
    typeof value.budget !== 'string' ||
    !tripTypes.includes(value.tripType!) ||
    !travelStyles.some((style) => style.label === value.travelStyle) ||
    !Array.isArray(value.interests) ||
    !value.interests.every((interest) => typeof interest === 'string')
  ) return null
  const validated = value as JourneyPlan
  return [0, 1, 2, 3].every((step) => !Object.keys(validateStep(validated, step)).length)
    ? validated
    : null
}

export function validateStep(values: JourneyPlan, step: number): PlanErrors {
  const errors: PlanErrors = {}
  if (step === 0) {
    if (!values.origin.trim()) errors.origin = 'Enter your starting location.'
    if (!values.destination.trim()) errors.destination = 'Enter your destination.'
  }
  if (step === 1) {
    if (!values.startDate) errors.startDate = 'Choose your departure date.'
    if (!values.endDate) errors.endDate = 'Choose your return date.'
    else if (values.startDate && values.endDate < values.startDate) {
      errors.endDate = 'Return cannot be before departure.'
    }
    if (!Number.isInteger(values.travelers) || values.travelers < 1 || values.travelers > 10) {
      errors.travelers = 'Choose between 1 and 10 travelers.'
    }
  }
  if (step === 2 && (!values.budget.trim() || !Number.isFinite(Number(values.budget)) || Number(values.budget) <= 0)) {
    errors.budget = 'Enter a positive total budget.'
  }
  if (step === 3 && !values.interests.length) errors.interests = 'Choose at least one interest.'
  return errors
}

export type StepProps = {
  values: JourneyPlan
  errors: PlanErrors
  onChange: (patch: Partial<JourneyPlan>) => void
}
