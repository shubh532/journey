import { useMemo, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router'
import { Alert, Avatar, Box, Button, Container, Paper, Snackbar, Stack, Typography } from '@mui/material'
import { ArrowLeft } from 'lucide'
import LucideIcon from '../components/LucideIcon'
import { previewUser } from '../components/home/data'
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
      <Container component="main" maxWidth="sm" sx={{ py: { xs: 3, sm: 5 } }}>
        <title>Journey | Journey</title>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>Let's plan your journey first</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            There's no generated journey to show yet. Complete the planner to preview one.
          </Alert>
          <Button component={RouterLink} to="/plan" variant="contained">Go to planning</Button>
        </Paper>
      </Container>
    )
  }

  const activeLabel = workspaceTabs.find((tab) => tab.id === activeTab)?.label

  return (
    <Box sx={{ minHeight: '100svh' }}>
      <title>{`${overview.title} | Journey`}</title>
      <Box component="header" sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h5" sx={{ color: 'primary.dark', fontWeight: 700 }}>Journey.</Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Button component={RouterLink} to="/home" startIcon={<LucideIcon node={ArrowLeft} />}>Home</Button>
            <Avatar aria-label={previewUser.name} sx={{ width: 36, height: 36, fontSize: '0.875rem' }}>
              {previewUser.initials}
            </Avatar>
          </Stack>
        </Container>
      </Box>
      <Container component="main" maxWidth="lg" sx={{ pt: { xs: 3, md: 5 } }}>
        <JourneyHero
          overview={overview}
          onModify={() => setNotice('Conversational editing is coming soon.')}
          onShare={() => setNotice('Sharing is coming soon.')}
        />
      </Container>
      <Box sx={{ mt: { xs: 3, md: 4 } }}>
        <WorkspaceTabs value={activeTab} onChange={setActiveTab} />
      </Box>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Box role="tabpanel" id="workspace-panel" aria-labelledby={`workspace-tab-${activeTab}`}>
          {activeTab === 'overview' ? (
            <Box sx={gridSx}>
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
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography component="h2" variant="h6">{activeLabel} is coming soon</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                This section of your journey is still being built.
              </Typography>
              <Button onClick={() => setActiveTab('overview')}>Back to overview</Button>
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
    </Box>
  )
}
