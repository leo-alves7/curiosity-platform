import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { fetchStores, fetchStore } from './stores'

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

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

const mockPaginatedStores = {
  items: [
    {
      id: 'store-1',
      name: 'Test Store',
      description: null,
      address: '123 Main St',
      lat: -23.55,
      lng: -46.63,
      category_id: 'cat-1',
      image_url: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
  total: 1,
  page: 1,
  page_size: 200,
}

describe('fetchStores', () => {
  it('returns paginated stores on success', async () => {
    server.use(
      http.get('http://localhost:8081/api/v1/stores', () => {
        return HttpResponse.json(mockPaginatedStores)
      }),
    )
    const result = await fetchStores()
    expect(result).toEqual(mockPaginatedStores)
  })

  it('passes page and page_size params', async () => {
    const captured = { url: null as URL | null }
    server.use(
      http.get('http://localhost:8081/api/v1/stores', ({ request }) => {
        captured.url = new URL(request.url)
        return HttpResponse.json(mockPaginatedStores)
      }),
    )
    await fetchStores(2, 50)
    expect(captured.url?.searchParams.get('page')).toBe('2')
    expect(captured.url?.searchParams.get('page_size')).toBe('50')
  })

  it('throws on server error', async () => {
    server.use(
      http.get('http://localhost:8081/api/v1/stores', () => {
        return HttpResponse.json({ detail: 'Internal server error' }, { status: 500 })
      }),
    )
    await expect(fetchStores()).rejects.toThrow()
  })
})

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

describe('fetchStore', () => {
  it('returns a store by id on success', async () => {
    server.use(
      http.get('http://localhost:8081/api/v1/stores/store-1', () => {
        return HttpResponse.json(mockStore)
      }),
    )
    const result = await fetchStore('store-1')
    expect(result).toEqual(mockStore)
  })

  it('encodes the id in the URL path', async () => {
    const captured = { pathname: '' }
    server.use(
      http.get('http://localhost:8081/api/v1/stores/store-abc', ({ request }) => {
        captured.pathname = new URL(request.url).pathname
        return HttpResponse.json(mockStore)
      }),
    )
    await fetchStore('store-abc')
    expect(captured.pathname).toBe('/api/v1/stores/store-abc')
  })

  it('throws on 404', async () => {
    server.use(
      http.get('http://localhost:8081/api/v1/stores/missing', () => {
        return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      }),
    )
    await expect(fetchStore('missing')).rejects.toThrow()
  })
})
