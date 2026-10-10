import { Box, Tab, Tabs } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { IconNode } from 'lucide'
import LucideIcon from '../LucideIcon'

type SideNavItem<T extends string> = { id: T; label: string; icon: IconNode }

type SideNavProps<T extends string> = {
  items: readonly SideNavItem<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  idPrefix: string
  panelId: string
}

export default function SideNav<T extends string>({ items, value, onChange, label, idPrefix, panelId }: SideNavProps<T>) {
  return (
    <Box component="nav" aria-label={label}>
      <Tabs
        orientation="vertical"
        value={value}
        onChange={(_, next: T) => onChange(next)}
        aria-label={label}
        slotProps={{ indicator: { sx: { display: 'none' } } }}
        sx={{ '& .MuiTabs-flexContainer': { gap: 0.5 } }}
      >
        {items.map((item) => (
          <Tab
            key={item.id}
            id={`${idPrefix}-${item.id}`}
            value={item.id}
            label={item.label}
            icon={<LucideIcon node={item.icon} />}
            iconPosition="start"
            aria-controls={panelId}
            sx={(theme) => ({
              justifyContent: 'flex-start',
              alignItems: 'center',
              textAlign: 'left',
              gap: 1.5,
              minHeight: 40,
              px: 1.5,
              '&.Mui-selected': {
                color: theme.palette.primary.dark,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                boxShadow: `inset 3px 0 0 ${theme.palette.primary.main}`,
              },
            })}
          />
        ))}
      </Tabs>
    </Box>
  )
}
