import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Alert,
  Box,
  Container,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import HomeHeader from '../components/home/HomeHeader'
import DestinationCard from '../components/home/DestinationCard'
import {
  destinations,
  navigationItems,
  type NavigationId,
} from '../components/home/data'

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<NavigationId>('upcoming')
  const query = search.trim().toLowerCase()
  const visibleDestinations = destinations.filter((destination) =>
    `${destination.name} ${destination.location}`.toLowerCase().includes(query),
  )

  return (
    <Box sx={{ minHeight: '100svh' }}>
      <title>Home | Journey</title>
      <HomeHeader search={search} onSearchChange={setSearch} />
      <Box
        component="nav"
        aria-label="Journey navigation"
        sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
      >
        <Container maxWidth="lg">
          <Tabs
            value={activeTab}
            onChange={(_, value: NavigationId) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="Journey categories"
          >
            {navigationItems.map((item) => (
              <Tab
                key={item.id}
                id={`tab-${item.id}`}
                value={item.id}
                label={item.label}
                aria-controls="destination-panel"
                sx={{ py: 2.5, px: { xs: 2, md: 3 } }}
              />
            ))}
          </Tabs>
        </Container>
      </Box>
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Box role="tabpanel" id="destination-panel" aria-labelledby={`tab-${activeTab}`}>
          <Typography variant="overline" color="primary.main">
            Explore the possibilities
          </Typography>
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontSize: { xs: '1.9rem', md: '2.6rem' }, mt: 1.5, mb: 2 }}
          >
            Discover your next<br />
            <Box component="span" sx={{ color: 'primary.dark' }}>
              unforgettable journey.
            </Box>
          </Typography>
          <Typography color="text.secondary" sx={{ mb: { xs: 4, md: 5 }, maxWidth: '52ch' }}>
            Explore handpicked destinations and find the inspiration for your next adventure.
          </Typography>
          {activeTab !== 'upcoming' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {navigationItems.find((item) => item.id === activeTab)?.label} is a preview tab.
              Browse destination inspiration below while this feature is being built.
            </Alert>
          )}
          {visibleDestinations.length ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 3,
              }}
            >
              {visibleDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  onPlan={(selected) =>
                    navigate(`/plan?destination=${encodeURIComponent(selected.id)}`)
                  }
                />
              ))}
            </Box>
          ) : (
            <Box role="status" sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="h6">No destinations found.</Typography>
              <Typography color="text.secondary">Try another destination or country.</Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  )
}
