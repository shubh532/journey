import { createElement } from 'react'
import { SvgIcon } from '@mui/material'
import type { IconNode } from 'lucide'

export default function LucideIcon({ node }: { node: IconNode }) {
  return (
    <SvgIcon
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      sx={{ fontSize: 20, flexShrink: 0, fill: 'none' }}
      aria-hidden="true"
    >
      {node.map(([tag, attributes], index) =>
        createElement(tag, { ...attributes, key: index }),
      )}
    </SvgIcon>
  )
}
