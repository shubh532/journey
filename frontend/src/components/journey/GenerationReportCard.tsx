import { Box, Chip, Divider, Stack, Typography } from '@mui/material'
import { CircleCheck, Info } from 'lucide'
import type { GenerationReportDto, GenerationStepDto } from '../../services/journeyApi'
import LucideIcon from '../LucideIcon'
import SectionCard from '../layout/SectionCard'

const statusLabel: Record<GenerationStepDto['status'], string> = {
  OK: 'Completed',
  FALLBACK: 'Estimated',
}

function formatDuration(ms: number) {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`
}

type GenerationReportCardProps = { report: GenerationReportDto }

/** Shows what each step of building the plan contributed, and where an estimate was used instead. */
export default function GenerationReportCard({ report }: GenerationReportCardProps) {
  const estimated = report.steps.filter((step) => step.status === 'FALLBACK').length

  return (
    <SectionCard title="How this plan was built">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {estimated === 0
          ? 'Every step used live research and travel data.'
          : `${estimated} of ${report.steps.length} steps used an estimate because live data wasn't available.`}
      </Typography>
      <Stack component="ol" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {report.steps.map((step) => {
          const done = step.status === 'OK'
          return (
            <Box component="li" key={step.id} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
              <Box
                aria-hidden="true"
                sx={{ display: 'flex', mt: 0.25, color: done ? 'success.main' : 'warning.main', flexShrink: 0 }}
              >
                <LucideIcon node={done ? CircleCheck : Info} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{step.label}</Typography>
                  <Chip
                    size="small"
                    label={statusLabel[step.status]}
                    color={done ? 'success' : 'warning'}
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, overflowWrap: 'anywhere' }}>
                  {step.detail}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        Built in {formatDuration(report.totalMs)} · Prices are always estimates · Reference {report.runId}
      </Typography>
    </SectionCard>
  )
}
