import { Box, Button, Stack, Typography } from '@mui/material'
import { ArrowRight } from 'lucide'
import LucideIcon from '../LucideIcon'

type SectionHeadingProps = {
  id: string
  title: string
  subtitle: string
  actionLabel?: string
  onAction?: () => void
}

export default function SectionHeading({ id, title, subtitle, actionLabel, onAction }: SectionHeadingProps) {
  return (
    <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mb: 1.75 }}>
      <Box>
        <Typography id={id} component="h2" sx={{ fontSize: { xs: 20, md: 22 }, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.25 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      </Box>
      {actionLabel && onAction && (
        <Button onClick={onAction} endIcon={<LucideIcon node={ArrowRight} />} sx={{ flexShrink: 0, minHeight: 32 }}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  )
}
