import type { ReactNode } from 'react'
import { Box, Container } from '@mui/material'
import { glassSurface } from '../../theme/tokens'
import ProfileMenu from './ProfileMenu'
import Wordmark from './Wordmark'

type AppHeaderProps = {
  maxWidth?: 'md' | 'lg' | 'xl' | false
  nav?: ReactNode
  search?: ReactNode
  actions?: ReactNode
  showProfileName?: boolean
}

export default function AppHeader({ maxWidth = 'lg', nav, search, actions, showProfileName = false }: AppHeaderProps) {
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
              ? { xs: '1fr auto', md: nav ? 'auto auto minmax(0, 1fr) auto' : 'auto minmax(0, 1fr) auto' }
              : nav
                ? { xs: '1fr auto', md: 'auto 1fr auto' }
                : '1fr auto',
            alignItems: 'center',
            columnGap: { xs: 2, md: 4 },
            rowGap: 1.5,
            py: { xs: 1.25, md: 1.5 },
          }}
        >
          <Box sx={{ gridColumn: 1, gridRow: 1 }}>
            <Wordmark to="/home" />
          </Box>
          {nav && <Box sx={{ display: { xs: 'none', md: 'block' }, gridColumn: { md: 2 }, gridRow: 1 }}>{nav}</Box>}
          {search && (
            <Box
              sx={{
                gridRow: { xs: 2, md: 1 },
                gridColumn: { xs: '1 / -1', md: nav ? 3 : 2 },
                justifySelf: { md: 'end' },
                width: '100%',
                maxWidth: { md: 360 },
              }}
            >
              {search}
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              gridRow: 1,
              gridColumn: { xs: 2, md: search ? (nav ? 4 : 3) : nav ? 3 : 2 },
              justifySelf: 'end',
            }}
          >
            {actions}
            <ProfileMenu showName={showProfileName} />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
