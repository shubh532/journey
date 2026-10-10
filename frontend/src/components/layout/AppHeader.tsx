import type { ReactNode } from 'react'
import { Box, Container } from '@mui/material'
import { glassSurface } from '../../theme/tokens'
import ProfileMenu from './ProfileMenu'
import Wordmark from './Wordmark'

type AppHeaderProps = {
  maxWidth?: 'md' | 'lg'
  search?: ReactNode
  actions?: ReactNode
  extra?: ReactNode
}

export default function AppHeader({ maxWidth = 'lg', search, actions, extra }: AppHeaderProps) {
  return (
    <Box
      component="header"
      sx={(theme) => ({
        ...glassSurface(theme),
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
        border: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
        borderRadius: 0,
        boxShadow: theme.shadows[1],
      })}
    >
      <Container maxWidth={maxWidth}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: search
              ? { xs: '1fr auto', md: 'auto minmax(0, 1fr) auto' }
              : '1fr auto',
            alignItems: 'center',
            columnGap: { xs: 2, md: 4 },
            rowGap: 1.5,
            py: { xs: 1.5, md: 2 },
          }}
        >
          <Wordmark to="/home" />
          {search && (
            <Box sx={{ gridRow: { xs: 2, md: 1 }, gridColumn: { xs: '1 / -1', md: 2 } }}>
              {search}
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              gridRow: 1,
              gridColumn: { xs: 2, md: search ? 3 : 2 },
            }}
          >
            {actions}
            <ProfileMenu />
          </Box>
          {extra && <Box sx={{ gridColumn: '1 / -1' }}>{extra}</Box>}
        </Box>
      </Container>
    </Box>
  )
}
