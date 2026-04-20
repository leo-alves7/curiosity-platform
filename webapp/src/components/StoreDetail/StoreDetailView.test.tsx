import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import StoreDetailView from './StoreDetailView'

vi.mock('../../auth/firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue('test-token'),
    },
  },
}))

vi.mock('firebase/auth', () => ({
  signOut: vi.fn(),
}))

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn().mockResolvedValue(undefined),
  },
}))

const mockStore = {
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

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
  cleanup()
})
afterAll(() => server.close())

function setup(storeId = 'store-1') {
  const onClose = vi.fn()
  const result = render(
    <StoreDetailView storeId={storeId} categoryMap={{ 'cat-1': 'Food' }} onClose={onClose} />,
  )
  return { onClose, ...result }
}

describe('StoreDetailView', () => {
  it('shows skeleton while loading', () => {
    server.use(
      http.get('http://localhost:8081/api/v1/stores/store-1', async () => {
        await new Promise(() => {})
        return HttpResponse.json(mockStore)
      }),
    )
    const { container } = setup()
    expect(container.querySelector('ion-skeleton-text')).not.toBeNull()
  })

  it('renders store fields after successful fetch', async () => {
    server.use(
      http.get('http://localhost:8081/api/v1/stores/store-1', () => {
        return HttpResponse.json(mockStore)
      }),
    )
    setup()
    await screen.findByText('Test Store')
    expect(screen.getByText('Test Store')).toBeDefined()
  })

  it('shows error state on fetch failure', async () => {
    server.use(
      http.get('http://localhost:8081/api/v1/stores/store-1', () => {
        return HttpResponse.json({ detail: 'Internal server error' }, { status: 500 })
      }),
    )
    setup()
    await screen.findByText(/failed/i)
  })

  it('calls onClose when close button is clicked', async () => {
    server.use(
      http.get('http://localhost:8081/api/v1/stores/store-1', () => {
        return HttpResponse.json(mockStore)
      }),
    )
    const { onClose, container } = setup()
    await screen.findByText('Test Store')
    const closeButton = container.querySelector('ion-button[fill="clear"]') as HTMLElement
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalled()
  })
})
