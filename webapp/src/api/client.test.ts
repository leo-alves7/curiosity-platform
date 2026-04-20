import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

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

describe('apiClient', () => {
  it('exports an axios instance', async () => {
    const { default: client } = await import('./client')
    expect(client).toBeDefined()
    expect(typeof client.get).toBe('function')
  })
})

describe('apiClient 401 interceptor', () => {
  it('retries with refreshed token on 401', async () => {
    const { auth } = await import('../auth/firebase')
    const { default: client } = await import('./client')
    let callCount = 0
    server.use(
      http.get('http://localhost:8081/test', () => {
        callCount++
        if (callCount === 1) return new HttpResponse(null, { status: 401 })
        return HttpResponse.json({ ok: true })
      }),
    )
    vi.mocked(auth.currentUser!.getIdToken).mockResolvedValue('refreshed-token')
    const response = await client.get('/test')
    expect(response.data).toEqual({ ok: true })
    expect(auth.currentUser!.getIdToken).toHaveBeenCalledWith(true)
  })

  it('calls signOut when token refresh fails on 401', async () => {
    const { auth } = await import('../auth/firebase')
    const { signOut } = await import('firebase/auth')
    const { default: client } = await import('./client')
    server.use(
      http.get('http://localhost:8081/test', () => new HttpResponse(null, { status: 401 })),
    )
    // First call: request interceptor (initial request) — must succeed so we get the 401 from MSW
    // Second call: getIdToken(true) in the response interceptor — must fail so signOut is called
    vi.mocked(auth.currentUser!.getIdToken)
      .mockResolvedValueOnce('initial-token')
      .mockRejectedValue(new Error('refresh failed'))
    await expect(client.get('/test')).rejects.toBeDefined()
    expect(signOut).toHaveBeenCalledWith(auth)
  })
})
