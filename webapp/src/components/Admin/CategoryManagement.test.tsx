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
import CategoryManagement from './CategoryManagement'

vi.mock('../../auth/firebase', () => ({
  auth: { currentUser: { getIdToken: vi.fn().mockResolvedValue('token') } },
}))
vi.mock('firebase/auth', () => ({ signOut: vi.fn() }))

const mockCategories = [
  {
    id: 'cat-1',
    name: 'Food',
    slug: 'food',
    icon: 'restaurant',
    color: '#FF0000',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    stores: [],
  },
  {
    id: 'cat-2',
    name: 'Shopping',
    slug: 'shopping',
    icon: null,
    color: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    stores: [],
  },
]

const server = setupServer(
  http.get('http://localhost:8081/api/v1/categories', () =>
    HttpResponse.json({ items: mockCategories, total: 2, page: 1, page_size: 20 }),
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
      <CategoryManagement />
    </Provider>,
  )
  return { store: testStore, ...result }
}

describe('CategoryManagement', () => {
  it('renders category list after loading', async () => {
    setup()
    await screen.findByText('Food')
    expect(screen.getByText('Shopping')).toBeDefined()
  })

  it('renders add category button', () => {
    setup()
    expect(screen.getByText('Add Category')).toBeDefined()
  })

  it('opens category form in create mode on add click', async () => {
    const user = userEvent.setup()
    const { store } = setup()
    await user.click(screen.getByText('Add Category'))
    expect(store.getState().admin.categoryForm.isOpen).toBe(true)
    expect(store.getState().admin.categoryForm.mode).toBe('create')
  })

  it('opens category form in edit mode on edit click', async () => {
    const user = userEvent.setup()
    const { store, container } = setup()
    await screen.findByText('Food')
    const clearButtons = container.querySelectorAll('ion-button[fill="clear"]:not([color])')
    if (clearButtons.length > 0) {
      await user.click(clearButtons[0] as HTMLElement)
    }
    expect(store.getState().admin.categoryForm.isOpen).toBe(true)
    expect(store.getState().admin.categoryForm.mode).toBe('edit')
  })
})
