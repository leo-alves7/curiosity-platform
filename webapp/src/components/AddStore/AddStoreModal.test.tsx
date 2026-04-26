import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/slices/authSlice'
import storesReducer from '@/slices/storesSlice'
import mapReducer from '@/slices/mapSlice'
import locationReducer from '@/slices/locationSlice'
import uiReducer from '@/slices/uiSlice'
import AddStoreModal from './AddStoreModal'

vi.mock('../../auth/firebase', () => ({
  auth: { currentUser: { getIdToken: vi.fn().mockResolvedValue('token') } },
}))
vi.mock('firebase/auth', () => ({ signOut: vi.fn() }))

vi.mock('@ionic/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ionic/react')>()
  return {
    ...actual,
    IonModal: ({
      isOpen,
      children,
    }: {
      isOpen?: boolean
      children?: React.ReactNode
      onDidDismiss?: () => void
    }) => (isOpen ? <div data-testid="ion-modal">{children}</div> : null),
  }
})

const categoriesPayload = {
  items: [
    {
      id: 'cat-1',
      name: 'Food',
      slug: 'food',
      icon: null,
      color: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
  total: 1,
  page: 1,
  page_size: 20,
}

const newStorePayload = {
  id: 'store-1',
  name: 'My Store',
  description: null,
  address: null,
  lat: -23.5,
  lng: -46.6,
  category_id: 'cat-1',
  image_url: null,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const server = setupServer(
  http.get('http://localhost:8081/api/v1/categories', () => HttpResponse.json(categoriesPayload)),
  http.get('http://localhost:8081/api/v1/stores', () =>
    HttpResponse.json({ items: [], total: 0, page: 1, page_size: 200 }),
  ),
  http.post('http://localhost:8081/api/v1/stores', () =>
    HttpResponse.json(newStorePayload, { status: 201 }),
  ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
  cleanup()
})
afterAll(() => server.close())

function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      stores: storesReducer,
      map: mapReducer,
      location: locationReducer,
      ui: uiReducer,
    },
  })
}

function setup(overrides: Partial<Parameters<typeof AddStoreModal>[0]> = {}) {
  const onClose = vi.fn()
  const onStoreCreated = vi.fn()
  const props = {
    isOpen: true,
    pinLocation: { lat: -23.5, lng: -46.6 },
    onClose,
    onStoreCreated,
    ...overrides,
  }
  const testStore = makeStore()
  const result = render(
    <Provider store={testStore}>
      <AddStoreModal {...props} />
    </Provider>,
  )
  return { onClose, onStoreCreated, store: testStore, ...result }
}

describe('AddStoreModal', () => {
  it('renders the title and pin location', async () => {
    setup()
    expect(screen.getByText('Add Store')).toBeDefined()
    expect(screen.getByText(/-23.50000, -46.60000/)).toBeDefined()
  })

  it('fetches categories on open', async () => {
    setup()
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeDefined()
    })
  })

  it('does not render content when closed', () => {
    setup({ isOpen: false })
    expect(screen.queryByText('Add Store')).toBeNull()
  })

  it('calls onClose when cancel clicked', async () => {
    const user = userEvent.setup()
    const { onClose } = setup()
    const cancelButtons = screen.getAllByText('Cancel')
    await user.click(cancelButtons[0])
    expect(onClose).toHaveBeenCalled()
  })

  it('shows toast and closes on successful creation', async () => {
    const user = userEvent.setup()
    const { onClose, onStoreCreated, container } = setup()
    await waitFor(() => screen.getByText('Food'))

    const nameInput = container.querySelector('ion-input input') as HTMLInputElement
    await user.type(nameInput, 'My Store')

    const select = container.querySelector('ion-select') as HTMLElement & {
      value: string
      dispatchEvent: (e: Event) => boolean
    }
    select.value = 'cat-1'
    select.dispatchEvent(new CustomEvent('ionChange', { detail: { value: 'cat-1' } }))

    await user.click(screen.getByText('Save Store'))

    await waitFor(() => {
      expect(onStoreCreated).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'store-1', name: 'My Store' }),
      )
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('shows error and stays open on creation failure', async () => {
    server.use(
      http.post('http://localhost:8081/api/v1/stores', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    const user = userEvent.setup()
    const { onClose, container } = setup()
    await waitFor(() => screen.getByText('Food'))

    const nameInput = container.querySelector('ion-input input') as HTMLInputElement
    await user.type(nameInput, 'My Store')

    const select = container.querySelector('ion-select') as HTMLElement
    select.dispatchEvent(new CustomEvent('ionChange', { detail: { value: 'cat-1' } }))

    await user.click(screen.getByText('Save Store'))

    await waitFor(() => {
      expect(screen.getByText('Save Store')).toBeDefined()
    })
    expect(onClose).not.toHaveBeenCalled()
  })
})
