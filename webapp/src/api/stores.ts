import client from './client'
import type { PaginatedStores, StoreResponse } from '@/types/store'

export async function fetchStores(page = 1, pageSize = 200): Promise<PaginatedStores> {
  const response = await client.get<PaginatedStores>('/api/v1/stores', {
    params: { page, page_size: pageSize },
  })
  return response.data
}

export async function fetchStore(id: string): Promise<StoreResponse> {
  const response = await client.get<StoreResponse>(`/api/v1/stores/${id}`)
  return response.data
}
