import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

/** Keep fixed drawers outside animated page containers, which establish a containing block. */
export function DrawerPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body)
}
