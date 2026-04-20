import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { fetchCategories } from './categories'

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

const mockCategories = [
  {
    id: 'cat-1',
    name: 'Food',
    slug: 'food',
    icon: null,
    color: '#ff0000',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

describe('fetchCategories', () => {
  it('returns categories on success', async () => {
    server.use(
      http.get('http://localhost:8081/api/v1/categories', () => {
        return HttpResponse.json(mockCategories)
      }),
    )
    const result = await fetchCategories()
    expect(result).toEqual(mockCategories)
  })

  it('throws on network error', async () => {
    server.use(
      http.get('http://localhost:8081/api/v1/categories', () => {
        return HttpResponse.error()
      }),
    )
    await expect(fetchCategories()).rejects.toThrow()
  })
})
