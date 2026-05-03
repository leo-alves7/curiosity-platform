import '@/i18n/index'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddStoreForm from './AddStoreForm'
import type { CategoryResponse } from '@/types/category'

vi.mock('../../auth/firebase', () => ({
  auth: { currentUser: { getIdToken: vi.fn().mockResolvedValue('token') } },
}))
vi.mock('firebase/auth', () => ({ signOut: vi.fn() }))

const categories: CategoryResponse[] = [
  {
    id: 'cat-1',
    name: 'Food',
    slug: 'food',
    icon: null,
    color: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Retail',
    slug: 'retail',
    icon: null,
    color: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function setup(overrides: Partial<Parameters<typeof AddStoreForm>[0]> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  const props = {
    pinLocation: { lat: -23.5, lng: -46.6 },
    categories,
    onSubmit,
    onCancel,
    isSubmitting: false,
    error: null,
    ...overrides,
  }
  const result = render(<AddStoreForm {...props} />)
  return { onSubmit, onCancel, ...result }
}

describe('AddStoreForm', () => {
  it('renders pin location coordinates', () => {
    setup()
    expect(screen.getByText(/-23.50000, -46.60000/)).toBeDefined()
  })

  it('shows validation error when name is too short', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup()
    await user.click(screen.getByText('Save Store'))
    expect(screen.getByText(/Name must be between 2 and 100/)).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error when category is missing', async () => {
    const user = userEvent.setup()
    const { container, onSubmit } = setup()
    const ionInput = container.querySelector('ion-input') as unknown as HTMLElement
    ionInput.dispatchEvent(new CustomEvent('ionInput', { detail: { value: 'My Store' } }))
    await user.click(screen.getByText('Save Store'))
    expect(screen.getByText('Category is required')).toBeDefined()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects non-image file', async () => {
    const user = userEvent.setup({ applyAccept: false })
    setup()
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    const fileInput = screen.getByLabelText('Photo') as HTMLInputElement
    await user.upload(fileInput, file)
    expect(screen.getByText('Please select an image file')).toBeDefined()
  })

  it('rejects images larger than 5MB', async () => {
    const user = userEvent.setup()
    setup()
    const big = new File([new Uint8Array(6 * 1024 * 1024)], 'big.png', { type: 'image/png' })
    const fileInput = screen.getByLabelText('Photo') as HTMLInputElement
    await user.upload(fileInput, big)
    expect(screen.getByText('Image must be smaller than 5MB')).toBeDefined()
  })

  it('disables inputs when isSubmitting', () => {
    setup({ isSubmitting: true })
    expect(screen.getByText('Saving...')).toBeDefined()
  })

  it('renders the error prop when provided', () => {
    setup({ error: 'Server error' })
    expect(screen.getByText('Server error')).toBeDefined()
  })

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    const { onCancel } = setup()
    const cancelButtons = screen.getAllByText('Cancel')
    await user.click(cancelButtons[0])
    expect(onCancel).toHaveBeenCalled()
  })
})
