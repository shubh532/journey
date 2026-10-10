import { Box, Container, Tab, Tabs } from '@mui/material'
import type { IconNode } from 'lucide'
import LucideIcon from '../LucideIcon'

type TabItem<T extends string> = { id: T; label: string; icon?: IconNode }

type TabNavProps<T extends string> = {
  items: readonly TabItem<T>[]
  value: T
  onChange: (value: T) => void
  navLabel: string
  tabsLabel: string
  idPrefix: string
  panelId: string
}

export default function TabNav<T extends string>({
  items,
  value,
  onChange,
  navLabel,
  tabsLabel,
  idPrefix,
  panelId,
}: TabNavProps<T>) {
  return (
    <Box
      component="nav"
      aria-label={navLabel}
      sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
    >
      <Container maxWidth="lg">
        <Tabs
          value={value}
          onChange={(_, next: T) => onChange(next)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label={tabsLabel}
        >
          {items.map((item) => (
            <Tab
              key={item.id}
              id={`${idPrefix}-${item.id}`}
              value={item.id}
              label={item.label}
              icon={item.icon ? <LucideIcon node={item.icon} /> : undefined}
              iconPosition="start"
              aria-controls={panelId}
              sx={{ px: { xs: 2, md: 2.5 }, '& > svg': { mr: 1 } }}
            />
          ))}
        </Tabs>
      </Container>
    </Box>
  )
}
