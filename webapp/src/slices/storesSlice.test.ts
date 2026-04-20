import { describe, it, expect } from 'vitest'
import storesReducer, { fetchStoresAndCategories } from './storesSlice'

const initialState = {
  items: [],
  categoryMap: {},
  status: 'idle' as const,
  error: null,
}

describe('storesSlice', () => {
  it('returns initial state', () => {
    expect(storesReducer(undefined, { type: '@@INIT' })).toEqual(initialState)
  })

  it('sets status to loading on pending', () => {
    const state = storesReducer(initialState, fetchStoresAndCategories.pending('', undefined))
    expect(state.status).toBe('loading')
    expect(state.error).toBeNull()
  })

  it('sets items and categoryMap on fulfilled', () => {
    const payload = {
      items: [
        {
          id: '1',
          name: 'Store A',
          description: null,
          address: null,
          lat: 0,
          lng: 0,
          category_id: 'cat1',
          image_url: null,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
      ],
      categoryMap: { cat1: 'Food' },
    }
    const state = storesReducer(
      { ...initialState, status: 'loading' },
      fetchStoresAndCategories.fulfilled(payload, '', undefined),
    )
    expect(state.status).toBe('succeeded')
    expect(state.items).toEqual(payload.items)
    expect(state.categoryMap).toEqual(payload.categoryMap)
  })

  it('sets error on rejected', () => {
    const state = storesReducer(
      { ...initialState, status: 'loading' },
      fetchStoresAndCategories.rejected(new Error('Network error'), '', undefined),
    )
    expect(state.status).toBe('failed')
    expect(state.error).toBe('Network error')
  })

  it('falls back to default error message when error has no message', () => {
    const action = fetchStoresAndCategories.rejected(new Error(''), '', undefined)
    const state = storesReducer({ ...initialState, status: 'loading' }, action)
    expect(state.error).toBe('Failed to load stores')
  })
})
