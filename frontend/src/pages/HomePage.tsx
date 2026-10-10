import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Box, Button, Container } from '@mui/material'
import { SearchX } from 'lucide'
import { destinations, type Destination } from '../components/home/data'
import { categories, indiaStates, worldPlaces } from '../components/home/exploreData'
import CategoryRow from '../components/home/CategoryRow'
import HomeHero from '../components/home/HomeHero'
import PlaceTiles from '../components/home/PlaceTiles'
import PopularDestinations from '../components/home/PopularDestinations'
import SectionHeading from '../components/home/SectionHeading'
import { useFavorites } from '../components/home/useFavorites'
import EmptyState from '../components/layout/EmptyState'
import MainHeader from '../components/layout/MainHeader'
import PageShell from '../components/layout/PageShell'
import motion from '../theme/motion.module.css'

const sectionSx = { mb: { xs: 4, md: 5 } }

export default function HomePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [search, setSearch] = useState(() => params.get('q') ?? '')
  const [category, setCategory] = useState<string | null>(null)
  const { favorites, toggle } = useFavorites()

  const query = search.trim().toLowerCase()
  const activeCategory = categories.find((item) => item.id === category)
  const visibleDestinations = destinations.filter(
    (destination) =>
      (!activeCategory || activeCategory.matches(destination)) &&
      `${destination.name} ${destination.location} ${destination.tags.join(' ')}`.toLowerCase().includes(query),
  )

  function planTrip(text: string) {
    const value = text.trim()
    const match = destinations.find(
      (destination) => destination.id === value.toLowerCase() || destination.name.toLowerCase() === value.toLowerCase(),
    )
    if (match) navigate(`/plan?destination=${encodeURIComponent(match.id)}`)
    else navigate(value ? `/plan?destination=${encodeURIComponent(value)}` : '/plan')
  }

  function clearFilters() {
    setSearch('')
    setCategory(null)
  }

  return (
    <PageShell>
      <title>Home | Journey</title>
      <MainHeader query={search} onQueryChange={setSearch} />
      <main>
        <HomeHero featured={destinations[0]} onPlan={planTrip} />
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
          <Box component="section" aria-labelledby="categories-title" sx={sectionSx} className={motion.fadeUp}>
            <SectionHeading
              id="categories-title"
              title="Explore by Category"
              subtitle="Find inspiration for your next journey"
              actionLabel={category ? 'Show all' : undefined}
              onAction={() => setCategory(null)}
            />
            <CategoryRow selected={category} onSelect={setCategory} />
          </Box>
          <Box component="section" aria-labelledby="popular-title" sx={sectionSx} className={motion.fadeUp}>
            <SectionHeading
              id="popular-title"
              title="Popular Destinations"
              subtitle={activeCategory ? `${activeCategory.label} · most loved by our travelers` : 'Most loved places by our travelers'}
              actionLabel={category || query ? 'View all destinations' : undefined}
              onAction={clearFilters}
            />
            {visibleDestinations.length ? (
              <PopularDestinations
                items={visibleDestinations}
                favorites={favorites}
                onToggleFavorite={toggle}
                onPlan={(destination: Destination) => planTrip(destination.id)}
              />
            ) : (
              <EmptyState
                role="status"
                icon={SearchX}
                title="No destinations found"
                description="Try another destination, country or category."
                action={<Button onClick={clearFilters}>Clear filters</Button>}
              />
            )}
          </Box>
          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' }, columnGap: 4, rowGap: { xs: 4, lg: 0 } }}
          >
            <Box component="section" aria-labelledby="states-title">
              <SectionHeading id="states-title" title="Explore India by State" subtitle="Discover the diverse beauty of India" />
              <PlaceTiles items={indiaStates} onPick={planTrip} />
            </Box>
            <Box component="section" aria-labelledby="world-title">
              <SectionHeading id="world-title" title="Explore the World" subtitle="Popular international destinations" />
              <PlaceTiles items={worldPlaces} onPick={planTrip} />
            </Box>
          </Box>
        </Container>
      </main>
    </PageShell>
  )
}
