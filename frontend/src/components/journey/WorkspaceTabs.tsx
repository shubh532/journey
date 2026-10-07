import { Box, Container, Tab, Tabs } from '@mui/material'
import LucideIcon from '../LucideIcon'
import { workspaceTabs, type WorkspaceTabId } from './workspace'

type WorkspaceTabsProps = { value: WorkspaceTabId; onChange: (tab: WorkspaceTabId) => void }

export default function WorkspaceTabs({ value, onChange }: WorkspaceTabsProps) {
  return (
    <Box component="nav" aria-label="Journey workspace" sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Tabs
          value={value}
          onChange={(_, next: WorkspaceTabId) => onChange(next)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Journey sections"
        >
          {workspaceTabs.map((tab) => (
            <Tab
              key={tab.id}
              id={`workspace-tab-${tab.id}`}
              value={tab.id}
              label={tab.label}
              icon={<LucideIcon node={tab.icon} />}
              iconPosition="start"
              aria-controls="workspace-panel"
              sx={{ minHeight: 56, px: { xs: 2, md: 3 } }}
            />
          ))}
        </Tabs>
      </Container>
    </Box>
  )
}
