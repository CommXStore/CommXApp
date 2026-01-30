'use client'

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type ComponentProps,
  type ElementType,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import { AnimatePresence, type Transition, motion } from 'motion/react'

import { cn } from '@/lib/utils'

type HighlightMode = 'children' | 'parent'

type Bounds = {
  top: number
  left: number
  width: number
  height: number
}

const DEFAULT_BOUNDS_OFFSET: Bounds = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
}

type HighlightContextType<T extends string> = {
  as?: keyof HTMLElementTagNameMap
  mode: HighlightMode
  activeValue: T | null
  setActiveValue: (value: T | null) => void
  setBounds: (bounds: DOMRect) => void
  clearBounds: () => void
  id: string
  hover: boolean
  click: boolean
  className?: string
  style?: CSSProperties
  activeClassName?: string
  setActiveClassName: (className: string) => void
  transition?: Transition
  disabled?: boolean
  enabled?: boolean
  exitDelay?: number
  forceUpdateBounds?: boolean
}

const HighlightContext = createContext<
  HighlightContextType<string> | undefined
>(undefined)

function useHighlight<T extends string>(): HighlightContextType<T> {
  const context = useContext(HighlightContext)
  if (!context) {
    throw new Error('useHighlight must be used within a HighlightProvider')
  }
  return context as unknown as HighlightContextType<T>
}

type BaseHighlightProps<T extends ElementType = 'div'> = {
  as?: T
  ref?: Ref<HTMLDivElement>
  mode?: HighlightMode
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  className?: string
  style?: CSSProperties
  transition?: Transition
  hover?: boolean
  click?: boolean
  disabled?: boolean
  enabled?: boolean
  exitDelay?: number
}

type ParentModeHighlightProps = {
  boundsOffset?: Partial<Bounds>
  containerClassName?: string
  forceUpdateBounds?: boolean
}

type ControlledParentModeHighlightProps<T extends ElementType = 'div'> =
  BaseHighlightProps<T> &
    ParentModeHighlightProps & {
      mode: 'parent'
      controlledItems: true
      children: ReactNode
    }

type ControlledChildrenModeHighlightProps<T extends ElementType = 'div'> =
  BaseHighlightProps<T> & {
    mode?: 'children' | undefined
    controlledItems: true
    children: ReactNode
  }

type UncontrolledParentModeHighlightProps<T extends ElementType = 'div'> =
  BaseHighlightProps<T> &
    ParentModeHighlightProps & {
      mode: 'parent'
      controlledItems?: false
      itemsClassName?: string
      children: ReactElement | ReactElement[]
    }

type UncontrolledChildrenModeHighlightProps<T extends ElementType = 'div'> =
  BaseHighlightProps<T> & {
    mode?: 'children'
    controlledItems?: false
    itemsClassName?: string
    children: ReactElement | ReactElement[]
  }

type HighlightProps<T extends ElementType = 'div'> =
  | ControlledParentModeHighlightProps<T>
  | ControlledChildrenModeHighlightProps<T>
  | UncontrolledParentModeHighlightProps<T>
  | UncontrolledChildrenModeHighlightProps<T>

function Highlight<T extends ElementType = 'div'>({
  ref,
  ...props
}: HighlightProps<T>) {
  const {
    as: Component = 'div',
    children,
    value,
    defaultValue,
    onValueChange,
    className,
    style,
    transition = { type: 'spring', stiffness: 350, damping: 35 },
    hover = false,
    click = true,
    enabled = true,
    controlledItems,
    disabled = false,
    exitDelay = 200,
    mode = 'children',
  } = props

  const localRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => localRef.current as HTMLDivElement)

  const propsBoundsOffset = (props as ParentModeHighlightProps)?.boundsOffset
  const boundsOffset = propsBoundsOffset ?? DEFAULT_BOUNDS_OFFSET
  const boundsOffsetTop = boundsOffset.top ?? 0
  const boundsOffsetLeft = boundsOffset.left ?? 0
  const boundsOffsetWidth = boundsOffset.width ?? 0
  const boundsOffsetHeight = boundsOffset.height ?? 0

  const boundsOffsetRef = useRef({
    top: boundsOffsetTop,
    left: boundsOffsetLeft,
    width: boundsOffsetWidth,
    height: boundsOffsetHeight,
  })

  useEffect(() => {
    boundsOffsetRef.current = {
      top: boundsOffsetTop,
      left: boundsOffsetLeft,
      width: boundsOffsetWidth,
      height: boundsOffsetHeight,
    }
  }, [boundsOffsetTop, boundsOffsetLeft, boundsOffsetWidth, boundsOffsetHeight])

  const [activeValue, setActiveValue] = useState<string | null>(
    value ?? defaultValue ?? null
  )
  const [boundsState, setBoundsState] = useState<Bounds | null>(null)
  const [activeClassNameState, setActiveClassNameState] = useState<string>('')

  const safeSetActiveValue = (nextId: string | null) => {
    setActiveValue(prev => {
      if (prev !== nextId) {
        onValueChange?.(nextId)
        return nextId
      }
      return prev
    })
  }

  const safeSetBoundsRef = useRef<((bounds: DOMRect) => void) | undefined>(
    undefined
  )

  useEffect(() => {
    safeSetBoundsRef.current = (bounds: DOMRect) => {
      if (!localRef.current) {
        return
      }

      const containerRect = localRef.current.getBoundingClientRect()
      const offset = boundsOffsetRef.current
      const newBounds: Bounds = {
        top: bounds.top - containerRect.top + offset.top,
        left: bounds.left - containerRect.left + offset.left,
        width: bounds.width + offset.width,
        height: bounds.height + offset.height,
      }

      setBoundsState(prev => {
        if (
          prev &&
          prev.top === newBounds.top &&
          prev.left === newBounds.left &&
          prev.width === newBounds.width &&
          prev.height === newBounds.height
        ) {
          return prev
        }
        return newBounds
      })
    }
  })

  const safeSetBounds = (bounds: DOMRect) => {
    safeSetBoundsRef.current?.(bounds)
  }

  const clearBounds = useCallback(() => {
    setBoundsState(prev => (prev === null ? prev : null))
  }, [])

  useEffect(() => {
    if (value !== undefined) {
      setActiveValue(value)
    } else if (defaultValue !== undefined) {
      setActiveValue(defaultValue)
    }
  }, [value, defaultValue])

  const id = useId()

  useEffect(() => {
    if (mode !== 'parent') {
      return
    }
    const container = localRef.current
    if (!container) {
      return
    }

    const onScroll = () => {
      if (!activeValue) {
        return
      }
      const activeEl = container.querySelector<HTMLElement>(
        `[data-value="${activeValue}"][data-highlight="true"]`
      )
      if (activeEl) {
        safeSetBoundsRef.current?.(activeEl.getBoundingClientRect())
      }
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [mode, activeValue])

  const render = (nodes: ReactNode) => {
    if (mode === 'parent') {
      return (
        <Component
          className={(props as ParentModeHighlightProps)?.containerClassName}
          data-slot="motion-highlight-container"
          ref={localRef}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <AnimatePresence initial={false} mode="wait">
            {boundsState && (
              <motion.div
                animate={{
                  top: boundsState.top,
                  left: boundsState.left,
                  width: boundsState.width,
                  height: boundsState.height,
                  opacity: 1,
                }}
                className={cn(className, activeClassNameState)}
                data-slot="motion-highlight"
                exit={{
                  opacity: 0,
                  transition: {
                    ...transition,
                    delay: (transition?.delay ?? 0) + (exitDelay ?? 0) / 1000,
                  },
                }}
                initial={{
                  top: boundsState.top,
                  left: boundsState.left,
                  width: boundsState.width,
                  height: boundsState.height,
                  opacity: 0,
                }}
                style={{ position: 'absolute', zIndex: 0, ...style }}
                transition={transition}
              />
            )}
          </AnimatePresence>
          {nodes}
        </Component>
      )
    }

    return nodes
  }

  let renderedChildren: ReactNode = children

  if (enabled) {
    if (controlledItems) {
      renderedChildren = render(children)
    } else {
      renderedChildren = render(
        Children.map(children, child => {
          const key =
            isValidElement(child) && child.key != null ? child.key : undefined
          return (
            <HighlightItem className={props?.itemsClassName} key={key}>
              {child}
            </HighlightItem>
          )
        })
      )
    }
  }

  return (
    <HighlightContext.Provider
      value={{
        mode,
        activeValue,
        setActiveValue: safeSetActiveValue,
        id,
        hover,
        click,
        className,
        style,
        transition,
        disabled,
        enabled,
        exitDelay,
        setBounds: safeSetBounds,
        clearBounds,
        activeClassName: activeClassNameState,
        setActiveClassName: setActiveClassNameState,
        forceUpdateBounds: (props as ParentModeHighlightProps)
          ?.forceUpdateBounds,
      }}
    >
      {renderedChildren}
    </HighlightContext.Provider>
  )
}

function getNonOverridingDataAttributes(
  element: ReactElement,
  dataAttributes: Record<string, unknown>
): Record<string, unknown> {
  return Object.keys(dataAttributes).reduce<Record<string, unknown>>(
    (acc, key) => {
      if ((element.props as Record<string, unknown>)[key] === undefined) {
        acc[key] = dataAttributes[key]
      }
      return acc
    },
    {}
  )
}

type ExtendedChildProps = ComponentProps<'div'> & {
  id?: string
  ref?: Ref<HTMLElement>
  'data-active'?: string
  'data-value'?: string
  'data-disabled'?: boolean
  'data-highlight'?: boolean
  'data-slot'?: string
}

type HighlightItemProps<T extends ElementType = 'div'> = ComponentProps<T> & {
  as?: T
  children: ReactElement
  id?: string
  value?: string
  className?: string
  style?: CSSProperties
  transition?: Transition
  activeClassName?: string
  disabled?: boolean
  exitDelay?: number
  asChild?: boolean
  forceUpdateBounds?: boolean
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: complex UI composition
function HighlightItem<T extends ElementType>({
  ref,
  as,
  children,
  id,
  value,
  className,
  style,
  transition,
  disabled = false,
  activeClassName,
  exitDelay,
  asChild = false,
  forceUpdateBounds,
  ...props
}: HighlightItemProps<T>) {
  const itemId = useId()
  const {
    activeValue,
    setActiveValue,
    mode,
    setBounds,
    clearBounds,
    hover,
    click,
    enabled,
    className: contextClassName,
    style: contextStyle,
    transition: contextTransition,
    id: contextId,
    disabled: contextDisabled,
    exitDelay: contextExitDelay,
    forceUpdateBounds: contextForceUpdateBounds,
    setActiveClassName,
  } = useHighlight()

  const Component = as ?? 'div'
  const element = children as ReactElement<ExtendedChildProps>
  const childValue =
    id ?? value ?? element.props?.['data-value'] ?? element.props?.id ?? itemId
  const isActive = activeValue === childValue
  const isDisabled = disabled === undefined ? contextDisabled : disabled
  const itemTransition = transition ?? contextTransition

  const localRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => localRef.current as HTMLDivElement)

  const refCallback = useCallback((node: HTMLElement | null) => {
    localRef.current = node as HTMLDivElement
  }, [])

  useEffect(() => {
    if (mode !== 'parent') {
      return
    }
    let rafId: number
    let previousBounds: Bounds | null = null
    const shouldUpdateBounds =
      forceUpdateBounds === true ||
      (contextForceUpdateBounds && forceUpdateBounds !== false)

    const updateBounds = () => {
      if (!localRef.current) {
        return
      }

      const bounds = localRef.current.getBoundingClientRect()

      if (shouldUpdateBounds) {
        if (
          previousBounds &&
          previousBounds.top === bounds.top &&
          previousBounds.left === bounds.left &&
          previousBounds.width === bounds.width &&
          previousBounds.height === bounds.height
        ) {
          rafId = requestAnimationFrame(updateBounds)
          return
        }
        previousBounds = bounds
        rafId = requestAnimationFrame(updateBounds)
      }

      setBounds(bounds)
    }

    if (isActive) {
      updateBounds()
      setActiveClassName(activeClassName ?? '')
    } else if (!activeValue) {
      clearBounds()
    }

    if (shouldUpdateBounds) {
      return () => cancelAnimationFrame(rafId)
    }
  }, [
    mode,
    isActive,
    activeValue,
    setBounds,
    clearBounds,
    activeClassName,
    setActiveClassName,
    forceUpdateBounds,
    contextForceUpdateBounds,
  ])

  if (!isValidElement(children)) {
    return children
  }

  const dataAttributes = {
    'data-active': isActive ? 'true' : 'false',
    'aria-selected': isActive,
    'data-disabled': isDisabled,
    'data-value': childValue,
    'data-highlight': true,
  }

  let commonHandlers: Partial<{
    onMouseEnter: (e: MouseEvent<HTMLDivElement>) => void
    onMouseLeave: (e: MouseEvent<HTMLDivElement>) => void
    onClick: (e: MouseEvent<HTMLDivElement>) => void
  }> = {}

  if (hover) {
    commonHandlers = {
      onMouseEnter: (e: MouseEvent<HTMLDivElement>) => {
        setActiveValue(childValue)
        element.props.onMouseEnter?.(e)
      },
      onMouseLeave: (e: MouseEvent<HTMLDivElement>) => {
        setActiveValue(null)
        element.props.onMouseLeave?.(e)
      },
    }
  } else if (click) {
    commonHandlers = {
      onClick: (e: MouseEvent<HTMLDivElement>) => {
        setActiveValue(childValue)
        element.props.onClick?.(e)
      },
    }
  }

  if (asChild) {
    if (mode === 'children') {
      return cloneElement(
        element,
        {
          key: childValue,
          ref: refCallback,
          className: cn('relative', element.props.className),
          ...getNonOverridingDataAttributes(element, {
            ...dataAttributes,
            'data-slot': 'motion-highlight-item-container',
          }),
          ...commonHandlers,
          ...props,
        },
        <>
          <AnimatePresence initial={false} mode="wait">
            {isActive && !isDisabled && (
              <motion.div
                animate={{ opacity: 1 }}
                className={cn(contextClassName, activeClassName)}
                data-slot="motion-highlight"
                exit={{
                  opacity: 0,
                  transition: {
                    ...itemTransition,
                    delay:
                      (itemTransition?.delay ?? 0) +
                      (exitDelay ?? contextExitDelay ?? 0) / 1000,
                  },
                }}
                initial={{ opacity: 0 }}
                layoutId={`transition-background-${contextId}`}
                style={{
                  position: 'absolute',
                  zIndex: 0,
                  ...contextStyle,
                  ...style,
                }}
                transition={itemTransition}
                {...dataAttributes}
              />
            )}
          </AnimatePresence>

          <Component
            className={className}
            data-slot="motion-highlight-item"
            style={{ position: 'relative', zIndex: 1 }}
            {...dataAttributes}
          >
            {children}
          </Component>
        </>
      )
    }

    return cloneElement(element, {
      ref: refCallback,
      ...getNonOverridingDataAttributes(element, {
        ...dataAttributes,
        'data-slot': 'motion-highlight-item',
      }),
      ...commonHandlers,
    })
  }

  return enabled ? (
    <Component
      className={cn(mode === 'children' && 'relative', className)}
      data-slot="motion-highlight-item-container"
      key={childValue}
      ref={localRef}
      {...dataAttributes}
      {...props}
      {...commonHandlers}
    >
      {mode === 'children' && (
        <AnimatePresence initial={false} mode="wait">
          {isActive && !isDisabled && (
            <motion.div
              animate={{ opacity: 1 }}
              className={cn(contextClassName, activeClassName)}
              data-slot="motion-highlight"
              exit={{
                opacity: 0,
                transition: {
                  ...itemTransition,
                  delay:
                    (itemTransition?.delay ?? 0) +
                    (exitDelay ?? contextExitDelay ?? 0) / 1000,
                },
              }}
              initial={{ opacity: 0 }}
              layoutId={`transition-background-${contextId}`}
              style={{
                position: 'absolute',
                zIndex: 0,
                ...contextStyle,
                ...style,
              }}
              transition={itemTransition}
              {...dataAttributes}
            />
          )}
        </AnimatePresence>
      )}

      {cloneElement(element, {
        style: { position: 'relative', zIndex: 1 },
        className: element.props.className,
        ...getNonOverridingDataAttributes(element, {
          ...dataAttributes,
          'data-slot': 'motion-highlight-item',
        }),
      })}
    </Component>
  ) : (
    children
  )
}

export {
  Highlight,
  HighlightItem,
  useHighlight,
  type HighlightProps,
  type HighlightItemProps,
}
