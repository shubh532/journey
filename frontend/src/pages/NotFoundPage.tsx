import { Link as RouterLink } from 'react-router'
import { Button, Container } from '@mui/material'
import { Compass } from 'lucide'
import EmptyState from '../components/layout/EmptyState'
import PageShell from '../components/layout/PageShell'
import Wordmark from '../components/layout/Wordmark'

export default function NotFoundPage() {
  return (
    <PageShell>
      <title>Page not found | Journey</title>
      <Container component="main" maxWidth="sm" sx={{ py: { xs: 4, sm: 8 }, flex: 1, textAlign: 'center' }}>
        <Wordmark to="/home" />
        <EmptyState
          headingComponent="h1"
          icon={Compass}
          title="This page took a wrong turn"
          description="The page you're looking for doesn't exist or has moved."
          action={<Button component={RouterLink} to="/home" variant="contained">Back to home</Button>}
        />
      </Container>
    </PageShell>
  )
}
