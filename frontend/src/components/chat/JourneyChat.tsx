import { Drawer } from '@mui/material'
import ChatPanel from './ChatPanel'

type JourneyChatProps = {
  open: boolean
  onClose: () => void
} & Omit<React.ComponentProps<typeof ChatPanel>, 'onClose'>

export default function JourneyChat({ open, onClose, ...panel }: JourneyChatProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': 'journey-chat-title',
          sx: { width: { xs: '100%', sm: 420 } },
        },
      }}
    >
      <ChatPanel {...panel} onClose={onClose} />
    </Drawer>
  )
}
