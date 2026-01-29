import '@testing-library/jest-dom/vitest'
import React from 'react'

Object.assign(globalThis, { React })

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.assign(globalThis, { ResizeObserver: ResizeObserverMock })
