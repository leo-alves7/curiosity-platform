import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import authReducer from '@/slices/authSlice'
import storesReducer from '@/slices/storesSlice'
import mapReducer from '@/slices/mapSlice'
import StoreDetailPage from './StoreDetailPage'

vi.mock('../auth/firebase', () => ({
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

function setup(id = 'store-1') {
  const testStore = configureStore({
    reducer: {
      auth: authReducer,
      stores: storesReducer,
      map: mapReducer,
    },
    preloadedState: {
      stores: {
        items: [],
        categories: [],
        categoryMap: { 'cat-1': 'Food' },
        status: 'succeeded' as const,
        error: null,
        searchQuery: '',
        selectedCategoryId: null,
        page: 1,
        pageSize: 20,
        hasMore: false,
      },
    },
  })
  const result = render(
    <Provider store={testStore}>
      <MemoryRouter initialEntries={[`/stores/${id}`]}>
        <Routes>
          <Route path="/stores/:id" element={<StoreDetailPage />} />
          <Route path="/" element={<div>Map</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
  return { store: testStore, ...result }
}

describe('StoreDetailPage', () => {
  it('renders the header toolbar', () => {
    server.use(
      http.get('http://localhost:8081/api/v1/stores/store-1', async () => {
        await new Promise(() => {})
        return HttpResponse.json(mockStore)
      }),
    )
    const { container } = setup()
    expect(container.querySelector('ion-toolbar')).not.toBeNull()
  })

  it('renders store fields after fetch succeeds', async () => {
    server.use(
      http.get('http://localhost:8081/api/v1/stores/store-1', () => {
        return HttpResponse.json(mockStore)
      }),
    )
    setup()
    await screen.findByText('Test Store')
    expect(screen.getByText('Test Store')).toBeDefined()
  })

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

  it('shows error state on fetch failure', async () => {
    server.use(
      http.get('http://localhost:8081/api/v1/stores/store-1', () => {
        return HttpResponse.json({ detail: 'Internal server error' }, { status: 500 })
      }),
    )
    setup()
    await screen.findByText(/failed|error/i)
  })
})
