import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StoreDetailContent from './StoreDetailContent'
import type { StoreResponse } from '@/types/store'

const mockStore: StoreResponse = {
  id: 'store-1',
  name: 'Test Store',
  description: 'A great store',
  address: '123 Main St',
  lat: -23.55,
  lng: -46.63,
  category_id: 'cat-1',
  image_url: null,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

function setup(overrides: Partial<StoreResponse> = {}) {
  const onShare = vi.fn()
  const onClose = vi.fn()
  const store = { ...mockStore, ...overrides }
  const result = render(
    <StoreDetailContent store={store} categoryName="Food" onShare={onShare} onClose={onClose} />,
  )
  return { onShare, onClose, store, ...result }
}

describe('StoreDetailContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders store name', () => {
    setup()
    expect(screen.getByText('Test Store')).toBeDefined()
  })

  it('renders category chip when categoryName is provided', () => {
    setup()
    expect(screen.getByText('Food')).toBeDefined()
  })

  it('renders address', () => {
    setup()
    expect(screen.getByText('123 Main St')).toBeDefined()
  })

  it('renders description', () => {
    setup()
    expect(screen.getByText('A great store')).toBeDefined()
  })

  it('shows fallback when description is null', () => {
    setup({ description: null })
    expect(screen.getByText('No description available.')).toBeDefined()
  })

  it('renders cover image when image_url is set', () => {
    setup({ image_url: 'https://example.com/store.jpg' })
    const img = screen.getByAltText('Test Store') as HTMLImageElement
    expect(img.src).toBe('https://example.com/store.jpg')
  })

  it('renders placeholder icon when image_url is null', () => {
    const { container } = setup({ image_url: null })
    expect(container.querySelector('ion-icon')).not.toBeNull()
    expect(screen.queryByAltText('Test Store')).toBeNull()
  })

  it('calls onShare when Share button is clicked', async () => {
    const { onShare } = setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('Share'))
    expect(onShare).toHaveBeenCalledOnce()
  })

  it('calls onClose when close button is clicked', async () => {
    const { onClose, container } = setup()
    const user = userEvent.setup()
    const closeButton = container.querySelector('ion-button[fill="clear"]') as HTMLElement
    await user.click(closeButton)
    expect(onClose).toHaveBeenCalledOnce()
  })
})
