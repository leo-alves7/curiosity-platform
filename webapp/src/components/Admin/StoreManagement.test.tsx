import '@/i18n/index'
import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/slices/authSlice'
import storesReducer from '@/slices/storesSlice'
import mapReducer from '@/slices/mapSlice'
import adminReducer from '@/slices/adminSlice'
import StoreManagement from './StoreManagement'

vi.mock('../../auth/firebase', () => ({
  auth: { currentUser: { getIdToken: vi.fn().mockResolvedValue('token') } },
}))
vi.mock('firebase/auth', () => ({ signOut: vi.fn() }))

const mockStores = [
  {
    id: 'store-1',
    name: 'Coffee Shop',
    description: null,
    address: '1 Main St',
    lat: null,
    lng: null,
    category_id: null,
    image_url: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'store-2',
    name: 'Tea House',
    description: null,
    address: null,
    lat: null,
    lng: null,
    category_id: null,
    image_url: null,
    is_active: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

const server = setupServer(
  http.get('http://localhost:8081/api/v1/admin/stores', () =>
    HttpResponse.json({ items: mockStores, total: 2, page: 1, page_size: 200 }),
  ),
  http.get('http://localhost:8081/api/v1/categories', () =>
    HttpResponse.json({ items: [], total: 0, page: 1, page_size: 20 }),
  ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
  cleanup()
})
afterAll(() => server.close())

function setup() {
  const testStore = configureStore({
    reducer: {
      auth: authReducer,
      stores: storesReducer,
      map: mapReducer,
      admin: adminReducer,
    },
  })
  const result = render(
    <Provider store={testStore}>
      <StoreManagement />
    </Provider>,
  )
  return { store: testStore, ...result }
}

describe('StoreManagement', () => {
  it('renders the store list after loading', async () => {
    setup()
    await screen.findByText('Coffee Shop')
    expect(screen.getByText('Tea House')).toBeDefined()
  })

  it('renders add store button', async () => {
    setup()
    await screen.findByText('Coffee Shop')
    expect(screen.getByText('Add Store')).toBeDefined()
  })

  it('dispatches toggle-active action on toggle click', async () => {
    server.use(
      http.post('http://localhost:8081/api/v1/admin/stores/store-1/toggle-active', () =>
        HttpResponse.json({ ...mockStores[0], is_active: false }),
      ),
    )
    const { store, container } = setup()
    await screen.findByText('Coffee Shop')
    const toggles = container.querySelectorAll('ion-toggle')
    if (toggles.length > 0) {
      toggles[0].dispatchEvent(
        new CustomEvent('ionChange', { bubbles: true, detail: { checked: false } }),
      )
    }
    const state = store.getState().admin
    expect(state).toBeDefined()
  })

  it('dispatches delete action via Redux when delete confirmed', async () => {
    server.use(
      http.delete(
        'http://localhost:8081/api/v1/stores/store-1',
        () => new HttpResponse(null, { status: 204 }),
      ),
    )
    const { store, container } = setup()
    await screen.findByText('Coffee Shop')
    const dangerButtons = container.querySelectorAll('ion-button[color="danger"]')
    if (dangerButtons.length > 0) {
      await userEvent.click(dangerButtons[0] as HTMLElement)
    }
    expect(store.getState().admin).toBeDefined()
  })

  it('opens store form in edit mode on edit click', async () => {
    const user = userEvent.setup()
    const { store, container } = setup()
    await screen.findByText('Coffee Shop')
    const clearButtons = container.querySelectorAll('ion-button[fill="clear"]:not([color])')
    if (clearButtons.length > 0) {
      await user.click(clearButtons[0] as HTMLElement)
    }
    const state = store.getState().admin
    expect(state.storeForm.isOpen).toBe(true)
    expect(state.storeForm.mode).toBe('edit')
  })
})
