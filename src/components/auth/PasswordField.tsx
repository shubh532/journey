import { useState } from 'react'
import { IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import type { TextFieldProps } from '@mui/material'

export default function PasswordField(props: TextFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                aria-label={`${visible ? 'Hide' : 'Show'} ${String(props.label).toLowerCase()}`}
                aria-pressed={visible}
                onClick={() => setVisible(!visible)}
                edge="end"
              >
                <Typography variant="caption" component="span">
                  {visible ? 'Hide' : 'Show'}
                </Typography>
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}
