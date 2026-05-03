import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeTruthy()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Try adjusting filters" />)
    expect(screen.getByText('Try adjusting filters')).toBeTruthy()
  })

  it('renders fallback icon when no animationData', () => {
    const { container } = render(<EmptyState title="Empty" />)
    // lucide icon renders as svg
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('omits description when not provided', () => {
    const { container } = render(<EmptyState title="Empty" />)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs.length).toBe(0)
  })
})
