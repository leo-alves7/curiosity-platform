import '@/i18n/index'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StoreCard from './StoreCard'
import type { StoreResponse } from '@/types/store'

const mockStore: StoreResponse = {
  id: 'store-1',
  name: 'Test Store',
  description: 'A test store',
  address: '123 Main St',
  lat: -23.55,
  lng: -46.63,
  category_id: 'cat-1',
  image_url: 'https://example.com/img.png',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

interface SetupOpts {
  overrides?: Partial<StoreResponse>
  categoryName?: string | null
}

function setup(opts: SetupOpts = {}) {
  const overrides = opts.overrides ?? {}
  const categoryName = 'categoryName' in opts ? opts.categoryName : 'Food'
  const onClick = vi.fn()
  const store = { ...mockStore, ...overrides }
  const result = render(
    <StoreCard store={store} categoryName={categoryName ?? undefined} onClick={onClick} />,
  )
  return { onClick, store, ...result }
}

describe('StoreCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the store name', () => {
    setup()
    expect(screen.getByText('Test Store')).toBeDefined()
  })

  it('renders the address', () => {
    setup()
    expect(screen.getByText('123 Main St')).toBeDefined()
  })

  it('renders category chip when category is provided', () => {
    setup({ categoryName: 'Food' })
    expect(screen.getByText('Food')).toBeDefined()
  })

  it('omits the category chip when categoryName is undefined', () => {
    setup({ categoryName: null })
    expect(screen.queryByText('Food')).toBeNull()
  })

  it('renders the image when image_url is provided', () => {
    setup()
    const img = screen.getByAltText('Test Store') as HTMLImageElement
    expect(img.src).toBe('https://example.com/img.png')
  })

  it('renders placeholder icon when image_url is null', () => {
    const { container } = setup({ overrides: { image_url: null } })
    expect(container.querySelector('svg')).not.toBeNull()
    expect(screen.queryByAltText('Test Store')).toBeNull()
  })

  it('falls back to Address unavailable when address is null', () => {
    setup({ overrides: { address: null } })
    expect(screen.getByText('Address unavailable')).toBeDefined()
  })

  it('calls onClick with the store id when clicked', async () => {
    const { onClick } = setup()
    const user = userEvent.setup()
    await user.click(screen.getByText('Test Store'))
    expect(onClick).toHaveBeenCalledWith('store-1')
  })

  it('renders image container with 16:9 aspect ratio', () => {
    const { container } = setup()
    const wrapper = container.querySelector('[style*="56.25%"]')
    expect(wrapper).not.toBeNull()
  })
})
