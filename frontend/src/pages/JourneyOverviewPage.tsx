import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fab,
  Paper,
  Snackbar,
  useMediaQuery,
} from '@mui/material'
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
import { mergeItinerary, type Activity, type Suggestion } from '../components/dashboard/itinerary'
import AppHeader from '../components/layout/AppHeader'
import EmptyState from '../components/layout/EmptyState'
import MainHeader from '../components/layout/MainHeader'
import PageShell from '../components/layout/PageShell'
import SideNav from '../components/layout/SideNav'
import TabNav from '../components/layout/TabNav'
import { fromJourneyDto, toActivity, type JourneyOverview } from '../components/journey/overview'
import { BudgetSnapshot, FlightPreviewCard, StayPreviewCard } from '../components/journey/OverviewSections'
import { workspaceTabs, type WorkspaceTabId } from '../components/journey/workspace'
import { toApiError, type ApiError } from '../services/apiError'
import { journeyApi, type JourneyDto } from '../services/journeyApi'
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

function JourneyUnavailable({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: ReactNode
}) {
  return (
    <PageShell>
      <title>Journey | Journey</title>
      <AppHeader maxWidth="md" />
      <Container component="main" maxWidth="sm" sx={{ py: { xs: 3, sm: 6 }, flex: 1 }}>
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <EmptyState
            headingComponent="h1"
            icon={Route}
            title={title}
            description={description}
            action={action}
          />
        </Paper>
      </Container>
    </PageShell>
  )
}

function Dashboard({
  journeyId,
  overview,
  baseItinerary,
}: {
  journeyId: string
  overview: JourneyOverview
  baseItinerary: Activity[]
}) {
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
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const chat = useJourneyChat(overview)

  const itinerary = useMemo(() => mergeItinerary(baseItinerary, added), [baseItinerary, added])
  const activeLabel = workspaceTabs.find((tab) => tab.id === activeTab)?.label
  const chatDocked = dockChat && !chatMinimized

  // Matched on content so items saved in an earlier visit still count as added.
  const isAdded = (suggestion: Suggestion, day: number) =>
    itinerary.some((item) => item.day === day && item.title === suggestion.title && item.kind === suggestion.kind)

  async function addActivity(suggestion: Suggestion, day: number) {
    if (isAdded(suggestion, day)) return
    try {
      const saved = await journeyApi.addItem(journeyId, {
        day,
        startMinutes: suggestion.minutes,
        kind: suggestion.kind,
        title: suggestion.title,
        place: suggestion.place,
        description: suggestion.description,
      })
      setAdded((current) => [...current, toActivity(saved)])
      setNotice(`Added "${suggestion.title}" to Day ${day}.`)
    } catch (error) {
      setNotice(toApiError(error).message)
    }
  }

  const editPlan = () => navigate('/plan', { state: { plan: overview.plan, journeyId } })

  async function deleteJourney() {
    setDeleting(true)
    try {
      await journeyApi.remove(journeyId)
      navigate('/home', { replace: true })
    } catch (error) {
      setConfirmingDelete(false)
      setNotice(toApiError(error).message)
    } finally {
      setDeleting(false)
    }
  }

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
                onDelete={() => setConfirmingDelete(true)}
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
      <Dialog
        open={confirmingDelete}
        onClose={() => !deleting && setConfirmingDelete(false)}
        aria-labelledby="delete-journey-title"
      >
        <DialogTitle id="delete-journey-title">Delete this journey?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{overview.title}" and its itinerary will be permanently deleted. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmingDelete(false)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={deleteJourney} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
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

type LoadResult = { key: string; journey?: JourneyDto; error?: ApiError }

export default function JourneyOverviewPage() {
  const { id } = useParams()
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState<LoadResult | null>(null)
  const key = `${id}:${attempt}`

  useEffect(() => {
    if (!id) return
    let active = true
    journeyApi
      .get(id)
      .then((journey) => active && setLoaded({ key, journey }))
      .catch((error: unknown) => active && setLoaded({ key, error: toApiError(error) }))
    return () => {
      active = false
    }
  }, [id, key])

  const result = loaded?.key === key ? loaded : null
  const journey = result?.journey
  const view = useMemo(() => (journey ? fromJourneyDto(journey) : null), [journey])

  if (!id || result?.error?.status === 404) {
    return (
      <JourneyUnavailable
        title="Journey not found"
        description="This journey doesn't exist or isn't yours to view."
        action={<Button component={RouterLink} to="/home" variant="contained">Back to home</Button>}
      />
    )
  }
  if (result?.error) {
    return (
      <JourneyUnavailable
        title="We couldn't load your journey"
        description={result.error.message}
        action={<Button variant="contained" onClick={() => setAttempt((current) => current + 1)}>Try again</Button>}
      />
    )
  }
  if (!result) {
    return (
      <PageShell>
        <title>Journey | Journey</title>
        <AppHeader maxWidth="md" />
        <Container component="main" maxWidth="sm" sx={{ py: 8, flex: 1, display: 'grid', placeItems: 'center' }}>
          <CircularProgress aria-label="Loading your journey" />
        </Container>
      </PageShell>
    )
  }
  if (!view) {
    return (
      <JourneyUnavailable
        title="This journey isn't ready yet"
        description="Its plan hasn't been generated. Open the planner to generate it."
        action={<Button component={RouterLink} to="/plan" variant="contained">Go to planning</Button>}
      />
    )
  }
  return <Dashboard key={id} journeyId={id} overview={view.overview} baseItinerary={view.itinerary} />
}
