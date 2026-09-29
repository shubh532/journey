import { Box, Button, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Check, type IconNode } from 'lucide'
import LucideIcon from '../LucideIcon'

type ChoiceProps = {
  label: string
  description?: string
  icon?: IconNode
  selected: boolean
  onClick: () => void
}

export default function PlanChoice({ label, description, icon, selected, onClick }: ChoiceProps) {
  return (
    <Button
      type="button"
      variant="outlined"
      aria-pressed={selected}
      onClick={onClick}
      sx={(theme) => ({
        justifyContent: 'flex-start',
        textAlign: 'left',
        gap: 1,
        p: 2,
        minHeight: 56,
        height: '100%',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.06) : 'background.paper',
        color: selected ? 'primary.dark' : 'text.primary',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        },
      })}
    >
      {icon && <LucideIcon node={icon} />}
      <Box component="span" sx={{ flex: 1 }}>
        <Typography component="span" variant="body2" sx={{ display: 'block', fontWeight: 600 }}>
          {label}
        </Typography>
        {description && (
          <Typography component="span" variant="caption" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {selected && <LucideIcon node={Check} />}
    </Button>
  )
}
