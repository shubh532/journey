import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Alert, Box, Container, Typography } from '@mui/material'
import { SearchX } from 'lucide'
import HomeHeader from '../components/home/HomeHeader'
import DestinationCard from '../components/home/DestinationCard'
import EmptyState from '../components/layout/EmptyState'
import PageShell from '../components/layout/PageShell'
import TabNav from '../components/layout/TabNav'
import {
  destinations,
  navigationItems,
  type NavigationId,
} from '../components/home/data'
import { brandGradient } from '../theme/tokens'
import motion from '../theme/motion.module.css'

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<NavigationId>('upcoming')
  const query = search.trim().toLowerCase()
  const visibleDestinations = destinations.filter((destination) =>
    `${destination.name} ${destination.location}`.toLowerCase().includes(query),
  )

  return (
    <PageShell>
      <title>Home | Journey</title>
      <HomeHeader search={search} onSearchChange={setSearch} />
      <TabNav
        items={navigationItems}
        value={activeTab}
        onChange={setActiveTab}
        navLabel="Journey navigation"
        tabsLabel="Journey categories"
        idPrefix="tab"
        panelId="destination-panel"
      />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 7 }, flex: 1 }}>
        <Box role="tabpanel" id="destination-panel" aria-labelledby={`tab-${activeTab}`}>
          <Box className={motion.fadeUp}>
            <Typography variant="overline" color="primary.main">
              Explore the possibilities
            </Typography>
            <Typography component="h1" variant="h2" sx={{ mt: 1.5, mb: 2 }}>
              Discover your next
              <Box
                component="span"
                sx={(theme) => ({
                  display: 'block',
                  backgroundImage: brandGradient(theme),
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  pb: 0.5,
                })}
              >
                unforgettable journey.
              </Box>
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: { xs: 4, md: 5 }, maxWidth: '52ch' }}>
              Explore handpicked destinations and find the inspiration for your next adventure.
            </Typography>
          </Box>
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
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
                gap: { xs: 2.5, md: 3 },
              }}
            >
              {visibleDestinations.map((destination, index) => (
                <Box
                  key={destination.id}
                  className={motion.fadeUp}
                  sx={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
                >
                  <DestinationCard
                    destination={destination}
                    onPlan={(selected) =>
                      navigate(`/plan?destination=${encodeURIComponent(selected.id)}`)
                    }
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <EmptyState
              role="status"
              icon={SearchX}
              title="No destinations found"
              description="Try another destination or country."
            />
          )}
        </Box>
      </Container>
    </PageShell>
  )
}
