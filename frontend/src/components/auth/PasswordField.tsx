import { useState } from 'react'
import { IconButton, InputAdornment, TextField, Tooltip } from '@mui/material'
import type { TextFieldProps } from '@mui/material'
import { Eye, EyeOff } from 'lucide'
import LucideIcon from '../LucideIcon'

export default function PasswordField(props: TextFieldProps) {
  const [visible, setVisible] = useState(false)
  const fieldName = typeof props.label === 'string' ? props.label.toLowerCase() : 'password'
  const actionLabel = `${visible ? 'Hide' : 'Show'} ${fieldName}`

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={actionLabel}>
                <IconButton
                  type="button"
                  aria-label={actionLabel}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                  edge="end"
                >
                  <LucideIcon node={visible ? EyeOff : Eye} />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}
