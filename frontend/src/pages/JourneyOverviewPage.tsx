import { useMemo, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router'
import { Box, Button, Container, Paper, Snackbar, Stack } from '@mui/material'
import { ArrowLeft, Hammer, Route } from 'lucide'
import LucideIcon from '../components/LucideIcon'
import AppHeader from '../components/layout/AppHeader'
import EmptyState from '../components/layout/EmptyState'
import PageShell from '../components/layout/PageShell'
import { readPlanState } from '../components/plan/model'
import { buildJourneyOverview } from '../components/journey/overview'
import JourneyHero from '../components/journey/JourneyHero'
import WorkspaceTabs from '../components/journey/WorkspaceTabs'
import { workspaceTabs, type WorkspaceTabId } from '../components/journey/workspace'
import {
  BudgetSnapshot,
  FlightPreviewCard,
  ItineraryPreview,
  PersonalizedInterests,
  StayPreviewCard,
  TripSnapshot,
} from '../components/journey/OverviewSections'
import motion from '../theme/motion.module.css'

const gridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
  gap: 3,
  alignItems: 'start',
}

export default function JourneyOverviewPage() {
  const location = useLocation()
  const plan = readPlanState(location.state)
  const overview = useMemo(() => (plan ? buildJourneyOverview(plan) : null), [plan])
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('overview')
  const [notice, setNotice] = useState('')

  if (!overview) {
    return (
      <PageShell>
        <title>Journey | Journey</title>
        <AppHeader maxWidth="md" />
        <Container component="main" maxWidth="sm" sx={{ py: { xs: 3, sm: 6 }, flex: 1 }}>
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <EmptyState
              headingComponent="h1"
              icon={Route}
              title="Let's plan your journey first"
              description="There's no generated journey to show yet. Complete the planner to preview one."
              action={<Button component={RouterLink} to="/plan" variant="contained">Go to planning</Button>}
            />
          </Paper>
        </Container>
      </PageShell>
    )
  }

  const activeLabel = workspaceTabs.find((tab) => tab.id === activeTab)?.label

  return (
    <PageShell>
      <title>{`${overview.title} | Journey`}</title>
      <AppHeader
        actions={
          <Button component={RouterLink} to="/home" startIcon={<LucideIcon node={ArrowLeft} />}>Home</Button>
        }
      />
      <Container component="main" maxWidth="lg" sx={{ pt: { xs: 3, md: 5 } }}>
        <Box className={motion.fadeUp}>
          <JourneyHero
            overview={overview}
            onModify={() => setNotice('Conversational editing is coming soon.')}
            onShare={() => setNotice('Sharing is coming soon.')}
          />
        </Box>
      </Container>
      <Box sx={{ mt: { xs: 3, md: 4 } }}>
        <WorkspaceTabs value={activeTab} onChange={setActiveTab} />
      </Box>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, flex: 1 }}>
        <Box role="tabpanel" id="workspace-panel" aria-labelledby={`workspace-tab-${activeTab}`}>
          {activeTab === 'overview' ? (
            <Box sx={gridSx} className={motion.fadeUp}>
              <ItineraryPreview overview={overview} onNavigate={setActiveTab} />
              <Stack spacing={3}>
                <TripSnapshot overview={overview} />
                <BudgetSnapshot overview={overview} />
              </Stack>
              <FlightPreviewCard overview={overview} onNavigate={setActiveTab} />
              <StayPreviewCard overview={overview} onNavigate={setActiveTab} />
              <Box sx={{ gridColumn: { md: '1 / -1' } }}>
                <PersonalizedInterests overview={overview} />
              </Box>
            </Box>
          ) : (
            <Paper variant="outlined">
              <EmptyState
                icon={Hammer}
                title={`${activeLabel} is coming soon`}
                description="This section of your journey is still being built."
                action={<Button onClick={() => setActiveTab('overview')}>Back to overview</Button>}
              />
            </Paper>
          )}
        </Box>
      </Container>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3000}
        onClose={() => setNotice('')}
        message={notice}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </PageShell>
  )
}
