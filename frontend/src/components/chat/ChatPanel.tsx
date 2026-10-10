import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Check, Plus, Send, Sparkles, X, type IconNode } from 'lucide'
import LucideIcon from '../LucideIcon'
import type { Suggestion } from '../dashboard/itinerary'
import { brandGradient } from '../../theme/tokens'
import styles from './JourneyChat.module.css'
import { suggestedQuestions } from './replies'
import type { ChatMessage } from './useJourneyChat'

type ChatPanelProps = {
  messages: ChatMessage[]
  pending: boolean
  onSend: (text: string) => void
  selectedDay: number
  isAdded: (suggestionId: string, day: number) => boolean
  onAdd: (suggestion: Suggestion, day: number) => void
  onEditPlan: () => void
  onClose?: () => void
  closeLabel?: string
  closeIcon?: IconNode
}

const MAX_LENGTH = 500

function AssistantAvatar({ size = 28 }: { size?: number }) {
  return (
    <Box
      aria-hidden="true"
      sx={(theme) => ({
        display: 'grid',
        placeItems: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: size > 30 ? '8px' : '50%',
        color: 'common.white',
        backgroundImage: brandGradient(theme),
      })}
    >
      <LucideIcon node={Sparkles} />
    </Box>
  )
}

export default function ChatPanel({
  messages,
  pending,
  onSend,
  selectedDay,
  isAdded,
  onAdd,
  onEditPlan,
  onClose,
  closeLabel = 'Close chat',
  closeIcon = X,
}: ChatPanelProps) {
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [messages, pending, reduceMotion])

  function submit(text: string) {
    if (!text.trim() || pending) return
    onSend(text)
    setDraft('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submit(draft)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit(draft)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', px: 2, py: 1.5 }}>
        <AssistantAvatar size={34} />
        <Typography id="journey-chat-title" component="h2" sx={{ flex: 1, fontSize: 17, fontWeight: 700 }}>
          Journey AI
        </Typography>
        {onClose && (
          <Tooltip title={closeLabel}>
            <IconButton aria-label={closeLabel} onClick={onClose}>
              <LucideIcon node={closeIcon} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Divider />
      <Stack
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        spacing={1.5}
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}
      >
        {messages.map((message) => {
          const mine = message.role === 'user'
          const bubble = (
            <Box
              sx={(theme) => ({
                px: 1.5,
                py: 1,
                borderRadius: '10px',
                whiteSpace: 'pre-line',
                overflowWrap: 'anywhere',
                minWidth: 0,
                ...(mine
                  ? { color: 'common.white', bgcolor: theme.palette.primary.main }
                  : { bgcolor: alpha(theme.palette.text.primary, 0.05) }),
              })}
            >
              <Typography variant="body2" component="p" sx={{ color: 'inherit', fontSize: 13.5 }}>{message.text}</Typography>
              {message.suggestions && (
                <Stack spacing={1} sx={{ mt: 1.25, whiteSpace: 'normal' }}>
                  {message.suggestions.map((suggestion, index) => {
                    const added = isAdded(suggestion.id, selectedDay)
                    return (
                      <Box
                        key={suggestion.id}
                        sx={{ p: 1.25, borderRadius: '8px', bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                          {index + 1}. {suggestion.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                          {suggestion.description}
                        </Typography>
                        <Button
                          variant={added ? 'text' : 'outlined'}
                          disabled={added}
                          onClick={() => onAdd(suggestion, selectedDay)}
                          startIcon={<LucideIcon node={added ? Check : Plus} />}
                          sx={{ minHeight: 32 }}
                        >
                          {added ? `Added to Day ${selectedDay}` : `Add to Day ${selectedDay}`}
                        </Button>
                      </Box>
                    )
                  })}
                </Stack>
              )}
              {message.offerEditPlan && (
                <Button variant="outlined" onClick={onEditPlan} sx={{ mt: 1.25 }}>Edit my plan</Button>
              )}
            </Box>
          )
          return mine ? (
            <Box key={message.id} sx={{ alignSelf: 'flex-end', maxWidth: '88%' }}>{bubble}</Box>
          ) : (
            <Stack key={message.id} direction="row" spacing={1} sx={{ alignSelf: 'flex-start', maxWidth: '96%', alignItems: 'flex-start' }}>
              <AssistantAvatar />
              {bubble}
            </Stack>
          )
        })}
        {pending && (
          <Stack direction="row" spacing={1} sx={{ alignSelf: 'flex-start', alignItems: 'center' }}>
            <AssistantAvatar />
            <Box
              role="status"
              aria-label="Journey AI is typing"
              sx={(theme) => ({
                display: 'flex',
                gap: 0.75,
                px: 1.75,
                py: 1.5,
                borderRadius: '10px',
                color: 'text.secondary',
                bgcolor: alpha(theme.palette.text.primary, 0.05),
              })}
            >
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </Box>
          </Stack>
        )}
        <div ref={endRef} />
      </Stack>
      <Box sx={{ p: 2, pt: 1 }}>
        {messages.length === 1 && (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
            {suggestedQuestions.map((question) => (
              <Chip
                key={question}
                label={question}
                variant="outlined"
                clickable
                disabled={pending}
                onClick={() => submit(question)}
              />
            ))}
          </Stack>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your trip..."
            multiline
            maxRows={4}
            fullWidth
            slotProps={{
              htmlInput: { 'aria-label': 'Message', maxLength: MAX_LENGTH },
              input: { sx: { borderRadius: '999px', px: 2 } },
            }}
          />
          <Tooltip title="Send">
            <span>
              <IconButton
                type="submit"
                aria-label="Send message"
                disabled={!draft.trim() || pending}
                sx={(theme) => ({
                  width: 40,
                  height: 40,
                  color: 'common.white',
                  bgcolor: theme.palette.primary.main,
                  '&:hover': { bgcolor: theme.palette.primary.dark },
                  '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
                })}
              >
                <LucideIcon node={Send} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, textAlign: 'center' }}>
          Preview · estimates only, nothing is booked
        </Typography>
      </Box>
    </Box>
  )
}
