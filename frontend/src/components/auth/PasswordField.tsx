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
                sx={{
                  borderRadius: 0.8,
                  minWidth: 44,
                  minHeight: 40,
                  '&.Mui-focusVisible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                  },
                }}
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
