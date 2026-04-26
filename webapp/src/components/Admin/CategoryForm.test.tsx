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
import adminReducer, { openCategoryForm, setSelectedCategory } from '@/slices/adminSlice'
import CategoryForm from './CategoryForm'

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

const server = setupServer(
  http.post('http://localhost:8081/api/v1/categories', () =>
    HttpResponse.json(
      {
        id: 'new-cat-1',
        name: 'New Category',
        slug: 'new-category',
        icon: null,
        color: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        stores: [],
      },
      { status: 201 },
    ),
  ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
  cleanup()
})
afterAll(() => server.close())

function setup(mode: 'create' | 'edit' = 'create') {
  const testStore = configureStore({
    reducer: {
      auth: authReducer,
      stores: storesReducer,
      map: mapReducer,
      admin: adminReducer,
    },
  })
  testStore.dispatch(openCategoryForm(mode))
  const result = render(
    <Provider store={testStore}>
      <CategoryForm />
    </Provider>,
  )
  return { store: testStore, ...result }
}

describe('CategoryForm', () => {
  it('renders create form with correct title', () => {
    setup('create')
    expect(screen.getByText('Add Category')).toBeDefined()
  })

  it('renders edit form with correct title', () => {
    const testStore = configureStore({
      reducer: {
        auth: authReducer,
        stores: storesReducer,
        map: mapReducer,
        admin: adminReducer,
      },
    })
    testStore.dispatch(
      setSelectedCategory({
        id: 'cat-1',
        name: 'Food',
        slug: 'food',
        icon: null,
        color: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }),
    )
    testStore.dispatch(openCategoryForm('edit'))
    render(
      <Provider store={testStore}>
        <CategoryForm />
      </Provider>,
    )
    expect(screen.getByText('Edit Category')).toBeDefined()
  })

  it('shows validation error when name is empty on submit', async () => {
    const user = userEvent.setup()
    setup('create')
    const submitButton = screen.getByText('Create Category')
    await user.click(submitButton)
    expect(screen.getByText('Name is required')).toBeDefined()
  })

  it('renders name and slug fields', () => {
    const { container } = setup('create')
    const inputs = container.querySelectorAll('ion-input')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('closes form on cancel', async () => {
    const user = userEvent.setup()
    const { store } = setup('create')
    await user.click(screen.getByText('Cancel'))
    expect(store.getState().admin.categoryForm.isOpen).toBe(false)
  })
})
