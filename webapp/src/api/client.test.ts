import { describe, it, expect, vi } from 'vitest'

vi.mock('../auth/keycloak', () => ({
  default: { token: 'test-token' },
}))

describe('apiClient', () => {
  it('exports an axios instance', async () => {
    const { default: client } = await import('./client')
    expect(client).toBeDefined()
    expect(typeof client.get).toBe('function')
  })
})
