'use client'

import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

import {
  Slot,
  type WithAsChild,
} from '@/components/animate-ui/primitives/animate/slot'

type ButtonProps = WithAsChild<
  {
    children?: ReactNode
    hoverScale?: number
    tapScale?: number
  } & HTMLMotionProps<'button'>
>

function Button({
  hoverScale = 1.05,
  tapScale = 0.95,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : motion.button

  return (
    <Component
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      {...props}
    >
      {children}
    </Component>
  )
}

export { Button, type ButtonProps }
