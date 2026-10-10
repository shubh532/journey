import { useMemo, useState, type ReactNode } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router'
import { Box, Button, Container, Divider, Fab, Paper, Snackbar, useMediaQuery } from '@mui/material'
import { ArrowLeft, Hammer, MessageCircle, Minus, Route } from 'lucide'
import LucideIcon from '../components/LucideIcon'
import ChatPanel from '../components/chat/ChatPanel'
import JourneyChat from '../components/chat/JourneyChat'
import { useJourneyChat } from '../components/chat/useJourneyChat'
import CostTiles from '../components/dashboard/CostTiles'
import DashboardHero from '../components/dashboard/DashboardHero'
import DestinationMap from '../components/dashboard/DestinationMap'
import ItineraryTimeline from '../components/dashboard/ItineraryTimeline'
import TopHighlights from '../components/dashboard/TopHighlights'
import {
  buildDailyItinerary,
  mergeItinerary,
  type Activity,
  type Suggestion,
} from '../components/dashboard/itinerary'
import AppHeader from '../components/layout/AppHeader'
import EmptyState from '../components/layout/EmptyState'
import MainHeader from '../components/layout/MainHeader'
import PageShell from '../components/layout/PageShell'
import SideNav from '../components/layout/SideNav'
import TabNav from '../components/layout/TabNav'
import { readPlanState } from '../components/plan/model'
import { buildJourneyOverview, type JourneyOverview } from '../components/journey/overview'
import { BudgetSnapshot, FlightPreviewCard, StayPreviewCard } from '../components/journey/OverviewSections'
import { workspaceTabs, type WorkspaceTabId } from '../components/journey/workspace'
import motion from '../theme/motion.module.css'

const DOCK_CHAT_QUERY = '(min-width: 1440px)'
const SIDEBAR_QUERY = '(min-width: 1200px)'
const stack = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 2 }
const overviewColumns = {
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 320px' },
  gap: 2,
  alignItems: 'start',
}

function Panel({ children }: { children: ReactNode }) {
  return <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>{children}</Paper>
}

function MissingPlan() {
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

function Dashboard({ overview }: { overview: JourneyOverview }) {
  const navigate = useNavigate()
  const dockChat = useMediaQuery(DOCK_CHAT_QUERY)
  const showSidebar = useMediaQuery(SIDEBAR_QUERY)
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('overview')
  const [selectedDay, setSelectedDay] = useState(1)
  const [added, setAdded] = useState<Activity[]>([])
  const [notice, setNotice] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMinimized, setChatMinimized] = useState(false)
  const [headerQuery, setHeaderQuery] = useState('')
  const chat = useJourneyChat(overview)

  const baseItinerary = useMemo(() => buildDailyItinerary(overview), [overview])
  const itinerary = useMemo(() => mergeItinerary(baseItinerary, added), [baseItinerary, added])
  const activeLabel = workspaceTabs.find((tab) => tab.id === activeTab)?.label
  const chatDocked = dockChat && !chatMinimized

  const isAdded = (suggestionId: string, day: number) =>
    added.some((activity) => activity.id === `${suggestionId}-day-${day}`)

  function addActivity(suggestion: Suggestion, day: number) {
    if (isAdded(suggestion.id, day)) return
    setAdded((current) => [...current, { ...suggestion, id: `${suggestion.id}-day-${day}`, day }])
    setNotice(`Added "${suggestion.title}" to Day ${day}.`)
  }

  const editPlan = () => navigate('/plan', { state: { plan: overview.plan } })

  const chatProps = {
    messages: chat.messages,
    pending: chat.pending,
    onSend: chat.send,
    selectedDay,
    isAdded,
    onAdd: addActivity,
    onEditPlan: editPlan,
  }

  function openChat() {
    if (dockChat) setChatMinimized(false)
    else setChatOpen(true)
  }

  const timeline = (showAllDays: boolean) => (
    <ItineraryTimeline
      items={itinerary}
      days={overview.days}
      startDate={overview.plan.startDate}
      selectedDay={selectedDay}
      onSelectDay={setSelectedDay}
      onViewAll={showAllDays ? undefined : () => setActiveTab('itinerary')}
      showAllDays={showAllDays}
    />
  )

  const panels: Record<WorkspaceTabId, ReactNode> = {
    overview: (
      <Box sx={overviewColumns} className={motion.fadeUp}>
        <Panel>
          <CostTiles overview={overview} limit={4} />
          <Divider sx={{ my: 2.5 }} />
          {timeline(false)}
        </Panel>
        <Box sx={stack}>
          <DestinationMap destination={overview.plan.destination} />
          <TopHighlights overview={overview} />
        </Box>
      </Box>
    ),
    itinerary: <Box className={motion.fadeUp}><Panel>{timeline(true)}</Panel></Box>,
    stay: <Box className={motion.fadeUp}><StayPreviewCard overview={overview} /></Box>,
    transport: <Box className={motion.fadeUp}><FlightPreviewCard overview={overview} /></Box>,
    budget: (
      <Box sx={stack} className={motion.fadeUp}>
        <Panel><CostTiles overview={overview} /></Panel>
        <BudgetSnapshot overview={overview} />
      </Box>
    ),
    map: <Box className={motion.fadeUp}><DestinationMap destination={overview.plan.destination} height={460} /></Box>,
    things: null,
    food: null,
    tips: null,
  }

  return (
    <PageShell>
      <title>{`${overview.title} | Journey`}</title>
      <MainHeader
        query={headerQuery}
        onQueryChange={setHeaderQuery}
        onSubmit={() => {
          const trimmed = headerQuery.trim()
          navigate(trimmed ? `/home?q=${encodeURIComponent(trimmed)}` : '/home')
        }}
      />
      <Container maxWidth={false} sx={{ py: { xs: 2, md: 2.5 }, px: { xs: 2, md: 3 }, flex: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: chatDocked ? 'minmax(0, 1fr) 360px' : 'minmax(0, 1fr)',
            gap: 2.5,
            alignItems: 'start',
          }}
        >
          <Box component="main" sx={{ ...stack, minWidth: 0, gap: { xs: 2, md: 2.5 } }}>
            <Button
              component={RouterLink}
              to="/home"
              color="inherit"
              startIcon={<LucideIcon node={ArrowLeft} />}
              sx={{ justifySelf: 'start', color: 'text.secondary' }}
            >
              Back to home
            </Button>
            <Box className={motion.fadeUp}>
              <DashboardHero
                overview={overview}
                onShare={() => setNotice('Sharing is coming soon.')}
                onEditPlan={editPlan}
                onChat={chatDocked ? undefined : openChat}
              />
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: showSidebar ? '184px minmax(0, 1fr)' : 'minmax(0, 1fr)',
                gap: { xs: 2, md: 2.5 },
                alignItems: 'start',
              }}
            >
              {showSidebar ? (
                <Box sx={{ position: 'sticky', top: 80 }}>
                  <SideNav
                    items={workspaceTabs}
                    value={activeTab}
                    onChange={setActiveTab}
                    label="Journey sections"
                    idPrefix="workspace-tab"
                    panelId="workspace-panel"
                  />
                </Box>
              ) : (
                <Box sx={{ mx: { xs: -2, md: -3 } }}>
                  <TabNav
                    items={workspaceTabs}
                    value={activeTab}
                    onChange={setActiveTab}
                    navLabel="Journey workspace"
                    tabsLabel="Journey sections"
                    idPrefix="workspace-tab"
                    panelId="workspace-panel"
                  />
                </Box>
              )}
              <Box role="tabpanel" id="workspace-panel" aria-labelledby={`workspace-tab-${activeTab}`} sx={{ minWidth: 0 }}>
                {panels[activeTab] ?? (
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
            </Box>
          </Box>
          {chatDocked && (
            <Paper
              component="aside"
              aria-labelledby="journey-chat-title"
              variant="outlined"
              sx={{ position: 'sticky', top: 80, height: 'calc(100svh - 100px)', overflow: 'hidden' }}
            >
              <ChatPanel
                {...chatProps}
                onClose={() => setChatMinimized(true)}
                closeLabel="Minimize chat"
                closeIcon={Minus}
              />
            </Paper>
          )}
        </Box>
      </Container>
      {!dockChat && <JourneyChat open={chatOpen} onClose={() => setChatOpen(false)} {...chatProps} />}
      {!chatDocked && !chatOpen && (
        <Fab
          variant="extended"
          color="primary"
          aria-label="Open chat about your journey"
          onClick={openChat}
          sx={{ position: 'fixed', right: { xs: 16, md: 32 }, bottom: { xs: 16, md: 32 }, gap: 1, px: 2.5 }}
        >
          <LucideIcon node={MessageCircle} />
          Ask Journey
        </Fab>
      )}
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

export default function JourneyOverviewPage() {
  const location = useLocation()
  const plan = readPlanState(location.state)
  const overview = useMemo(() => (plan ? buildJourneyOverview(plan) : null), [plan])

  return overview ? <Dashboard key={location.key} overview={overview} /> : <MissingPlan />
}
