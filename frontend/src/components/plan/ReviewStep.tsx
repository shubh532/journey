import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material'
import type { JourneyPlan } from './model'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export default function ReviewStep({ values, onEdit }: { values: JourneyPlan; onEdit: (step: number) => void }) {
  const sections = [
    { title: 'Destination', detail: `${values.origin} → ${values.destination}` },
    { title: 'Dates & travelers', detail: `${formatDate(values.startDate)} – ${formatDate(values.endDate)} · ${values.travelers} ${values.travelers === 1 ? 'traveler' : 'travelers'} · ${values.tripType}` },
    { title: 'Budget & style', detail: `${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(values.budget))} total · ${values.travelStyle}` },
  ]

  return (
    <Stack spacing={2.5} divider={<Divider />}>
      {sections.map((section, index) => (
        <Box key={section.title}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography component="h3" variant="subtitle2">{section.title}</Typography>
            <Button type="button" onClick={() => onEdit(index)} aria-label={`Edit ${section.title}`}>Edit</Button>
          </Stack>
          <Typography sx={{ overflowWrap: 'anywhere' }}>{section.detail}</Typography>
        </Box>
      ))}
      <Box>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography component="h3" variant="subtitle2">Interests</Typography>
          <Button type="button" onClick={() => onEdit(3)} aria-label="Edit interests">Edit</Button>
        </Stack>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {values.interests.map((interest) => <Chip key={interest} label={interest} />)}
        </Box>
      </Box>
    </Stack>
  )
}
