import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StoreList from './StoreList'
import type { StoreResponse } from '@/types/store'

function makeStore(overrides: Partial<StoreResponse> = {}): StoreResponse {
  return {
    id: 'store-1',
    name: 'Store One',
    description: null,
    address: '123 Main St',
    lat: 0,
    lng: 0,
    category_id: 'cat-1',
    image_url: null,
    is_active: true,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

interface SetupOpts {
  stores?: StoreResponse[]
  categoryMap?: Record<string, string>
  status?: 'idle' | 'loading' | 'succeeded' | 'failed'
  error?: string | null
  hasMore?: boolean
}

function setup(opts: SetupOpts = {}) {
  const onStoreClick = vi.fn()
  const onLoadMore = vi.fn()
  const result = render(
    <StoreList
      stores={opts.stores ?? []}
      categoryMap={opts.categoryMap ?? {}}
      status={opts.status ?? 'succeeded'}
      error={opts.error ?? null}
      onStoreClick={onStoreClick}
      onLoadMore={onLoadMore}
      hasMore={opts.hasMore ?? false}
    />,
  )
  return { onStoreClick, onLoadMore, ...result }
}

describe('StoreList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders loading spinner when loading with no stores', () => {
    setup({ status: 'loading', stores: [] })
    expect(screen.getByLabelText('Loading stores')).toBeDefined()
  })

  it('renders empty state when no stores and status is not loading', () => {
    setup({ status: 'succeeded', stores: [] })
    expect(screen.getByText(/No stores found/i)).toBeDefined()
  })

  it('renders error message when status is failed', () => {
    setup({ status: 'failed', error: 'Network error' })
    expect(screen.getByText(/Failed to load stores: Network error/)).toBeDefined()
  })

  it('renders a list of store cards', () => {
    setup({
      stores: [makeStore({ id: '1', name: 'Alpha' }), makeStore({ id: '2', name: 'Beta' })],
    })
    expect(screen.getByText('Alpha')).toBeDefined()
    expect(screen.getByText('Beta')).toBeDefined()
  })

  it('passes category names from categoryMap to cards', () => {
    setup({
      stores: [makeStore({ id: '1', category_id: 'cat-1' })],
      categoryMap: { 'cat-1': 'Food' },
    })
    expect(screen.getByText('Food')).toBeDefined()
  })

  it('calls onStoreClick when a card is clicked', async () => {
    const { onStoreClick } = setup({ stores: [makeStore({ id: 'xyz', name: 'Clicky' })] })
    const user = userEvent.setup()
    await user.click(screen.getByText('Clicky'))
    expect(onStoreClick).toHaveBeenCalledWith('xyz')
  })
})
