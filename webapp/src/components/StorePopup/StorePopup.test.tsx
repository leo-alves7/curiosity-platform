import '@/i18n/index'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StorePopup from './StorePopup'
import type { StoreResponse } from '@/types/store'

const mockStore: StoreResponse = {
  id: 'store-1',
  name: 'Test Store',
  description: 'A test store',
  address: '123 Main St',
  lat: -23.55,
  lng: -46.63,
  category_id: 'cat-1',
  image_url: null,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

function setup(overrides: Partial<StoreResponse> = {}, categoryName?: string) {
  const onViewDetails = vi.fn()
  const store = { ...mockStore, ...overrides }
  render(<StorePopup store={store} categoryName={categoryName} onViewDetails={onViewDetails} />)
  return { onViewDetails }
}

describe('StorePopup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the store name', () => {
    setup()
    expect(screen.getByText('Test Store')).toBeDefined()
  })

  it('renders the category name when provided', () => {
    setup({}, 'Food')
    expect(screen.getByText('Food')).toBeDefined()
  })

  it('falls back to Uncategorised when categoryName is undefined', () => {
    setup({}, undefined)
    expect(screen.getByText('Uncategorised')).toBeDefined()
  })

  it('renders the address', () => {
    setup()
    expect(screen.getByText('123 Main St')).toBeDefined()
  })

  it('falls back to Address unavailable when address is null', () => {
    setup({ address: null })
    expect(screen.getByText('Address unavailable')).toBeDefined()
  })

  it('renders the View details button', () => {
    setup()
    expect(screen.getByText(/view details/i)).toBeDefined()
  })

  it('calls onViewDetails with store id when button is clicked', async () => {
    const { onViewDetails } = setup()
    const user = userEvent.setup()
    await user.click(screen.getByText(/view details/i))
    expect(onViewDetails).toHaveBeenCalledWith('store-1')
  })
})
