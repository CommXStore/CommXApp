'use client'

import {
  isValidElement,
  useMemo,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefCallback,
  type RefObject,
} from 'react'
import { motion, isMotionComponent, type HTMLMotionProps } from 'motion/react'
import { cn } from '@/lib/utils'

type AnyProps = Record<string, unknown>

type DOMMotionProps<T extends HTMLElement = HTMLElement> = Omit<
  HTMLMotionProps<keyof HTMLElementTagNameMap>,
  'ref'
> & { ref?: Ref<T> }

type WithAsChild<Base extends object> =
  | (Base & { asChild: true; children: ReactElement })
  | (Base & { asChild?: false | undefined })

type SlotProps<T extends HTMLElement = HTMLElement> = {
  children?: ReactNode
} & DOMMotionProps<T>

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return node => {
    for (const ref of refs) {
      if (!ref) {
        continue
      }
      if (typeof ref === 'function') {
        ref(node)
      } else {
        ;(ref as RefObject<T | null>).current = node
      }
    }
  }
}

function mergeProps<T extends HTMLElement>(
  childProps: AnyProps,
  slotProps: DOMMotionProps<T>
): AnyProps {
  const merged: AnyProps = { ...childProps, ...slotProps }

  if (childProps.className || slotProps.className) {
    merged.className = cn(
      childProps.className as string,
      slotProps.className as string
    )
  }

  if (childProps.style || slotProps.style) {
    merged.style = {
      ...(childProps.style as CSSProperties),
      ...(slotProps.style as CSSProperties),
    }
  }

  return merged
}

function Slot<T extends HTMLElement = HTMLElement>({
  children,
  ref,
  ...props
}: SlotProps<T>) {
  const isValidChild = isValidElement(children)
  const isAlreadyMotion =
    isValidChild &&
    typeof children.type === 'object' &&
    children.type !== null &&
    isMotionComponent(children.type)

  const Base = useMemo(() => {
    if (!isValidChild) {
      return motion.create('span')
    }
    if (isAlreadyMotion) {
      return children.type as ElementType
    }
    return motion.create(children.type as ElementType)
  }, [isAlreadyMotion, isValidChild, children])

  if (!isValidChild) {
    return null
  }

  const { ref: childRef, ...childProps } = children.props as AnyProps

  const mergedProps = mergeProps(childProps, props)

  return <Base {...mergedProps} ref={mergeRefs(childRef as Ref<T>, ref)} />
}

export {
  Slot,
  type SlotProps,
  type WithAsChild,
  type DOMMotionProps,
  type AnyProps,
}
