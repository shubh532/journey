import { Box, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import {
  MapPin, Navigation, Minus, Plus, Users, Mountain, Trees,
  Utensils, Waves, Landmark, Music, ShoppingBag, Sun,
} from 'lucide'
import LucideIcon from '../LucideIcon'
import PlanChoice from './PlanChoice'
import { interests, travelStyles, tripTypes, type StepProps } from './model'

const interestIcons = [Mountain, Trees, Utensils, Waves, Landmark, Music, ShoppingBag, Sun]
const columns = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }

export function DestinationStep({ values, errors, onChange }: StepProps) {
  return (
    <Box sx={columns}>
      {(['origin', 'destination'] as const).map((field) => (
        <TextField
          key={field}
          id={`plan-${field}`}
          name={field}
          label={field === 'origin' ? 'From' : 'Destination'}
          placeholder={field === 'origin' ? 'Where are you starting from?' : 'Where do you want to go?'}
          value={values[field]}
          required
          fullWidth
          onChange={(event) => onChange({ [field]: event.target.value })}
          onBlur={() => onChange({ [field]: values[field].trim() })}
          error={Boolean(errors[field])}
          helperText={errors[field]}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LucideIcon node={field === 'origin' ? MapPin : Navigation} />
                </InputAdornment>
              ),
            },
          }}
        />
      ))}
    </Box>
  )
}

export function DatesTravelersStep({ values, errors, onChange }: StepProps) {
  return (
    <Stack spacing={3}>
      <Box sx={columns}>
        {(['startDate', 'endDate'] as const).map((field) => (
          <TextField
            key={field}
            id={`plan-${field}`}
            name={field}
            label={field === 'startDate' ? 'Departure' : 'Return'}
            type="date"
            value={values[field]}
            required
            fullWidth
            onChange={(event) => onChange({ [field]: event.target.value })}
            error={Boolean(errors[field])}
            helperText={errors[field]}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: field === 'endDate' ? values.startDate : undefined },
            }}
          />
        ))}
      </Box>
      <Box>
        <Typography component="h3" variant="subtitle2" sx={{ mb: 1 }}>Travelers</Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <LucideIcon node={Users} />
          <IconButton
            type="button"
            aria-label="Remove traveler"
            disabled={values.travelers <= 1}
            onClick={() => onChange({ travelers: values.travelers - 1 })}
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <LucideIcon node={Minus} />
          </IconButton>
          <Typography aria-live="polite">{values.travelers}</Typography>
          <IconButton
            type="button"
            aria-label="Add traveler"
            disabled={values.travelers >= 10}
            onClick={() => onChange({ travelers: values.travelers + 1 })}
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <LucideIcon node={Plus} />
          </IconButton>
          <Typography variant="caption" color="text.secondary">Up to 10</Typography>
        </Stack>
      </Box>
      <Box role="group" aria-label="Trip type">
        <Typography component="h3" variant="subtitle2" sx={{ mb: 1.5 }}>Who's coming along?</Typography>
        <Box sx={{ ...columns, gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' } }}>
          {tripTypes.map((label) => (
            <PlanChoice
              key={label}
              label={label}
              selected={values.tripType === label}
              onClick={() => onChange({ tripType: label })}
            />
          ))}
        </Box>
      </Box>
    </Stack>
  )
}

export function TravelStyleStep({ values, errors, onChange }: StepProps) {
  return (
    <Stack spacing={3}>
      <TextField
        id="plan-budget"
        name="budget"
        label="Total trip budget (INR)"
        type="number"
        value={values.budget}
        required
        fullWidth
        error={Boolean(errors.budget)}
        helperText={errors.budget || `Total for ${values.travelers} ${values.travelers === 1 ? 'traveler' : 'travelers'}, not per person.`}
        onChange={(event) => onChange({ budget: event.target.value })}
        slotProps={{
          htmlInput: { min: 1, step: 'any' },
          input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
        }}
      />
      <Box role="group" aria-label="Travel style">
        <Typography component="h3" variant="subtitle2" sx={{ mb: 1.5 }}>Travel style</Typography>
        <Box sx={{ ...columns, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
          {travelStyles.map((option) => (
            <PlanChoice
              key={option.label}
              {...option}
              selected={values.travelStyle === option.label}
              onClick={() => onChange({ travelStyle: option.label })}
            />
          ))}
        </Box>
      </Box>
    </Stack>
  )
}

export function InterestsStep({ values, errors, onChange }: StepProps) {
  return (
    <Box role="group" aria-label="Interests" aria-describedby={errors.interests ? 'interests-error' : undefined}>
      <Box sx={columns}>
        {interests.map((label, index) => (
          <PlanChoice
            key={label}
            label={label}
            icon={interestIcons[index]}
            selected={values.interests.includes(label)}
            onClick={() => onChange({
              interests: values.interests.includes(label)
                ? values.interests.filter((item) => item !== label)
                : [...values.interests, label],
            })}
          />
        ))}
      </Box>
      {errors.interests && (
        <Typography id="interests-error" role="alert" color="error" variant="body2" sx={{ mt: 2 }}>
          {errors.interests}
        </Typography>
      )}
    </Box>
  )
}
