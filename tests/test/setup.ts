import '@testing-library/jest-dom/vitest'
import React from 'react'

Object.assign(globalThis, { React })

class ResizeObserverMock {
  observe() {
    // noop
  }
  unobserve() {
    // noop
  }
  disconnect() {
    // noop
  }
}

Object.assign(globalThis, { ResizeObserver: ResizeObserverMock })
