import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import ErrorBoundary from './ErrorBoundary'

vi.mock('@sentry/capacitor', () => ({
  captureException: vi.fn(),
}))

vi.mock('@ionic/react', () => ({
  IonApp: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-app">{children}</div>,
  IonContent: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-content">{children}</div>,
  IonText: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-text">{children}</div>,
}))

interface ThrowingChildProps {
  shouldThrow?: boolean
}

function ThrowingChild({ shouldThrow = false }: ThrowingChildProps) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Child content</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong. Please refresh the page.')).toBeInTheDocument()
  })

  it('renders custom fallback when provided and a child throws', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Custom error UI')).toBeInTheDocument()
  })
})
