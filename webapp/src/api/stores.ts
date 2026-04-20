import client from './client'
import type { PaginatedStores } from '@/types/store'

export async function fetchStores(page = 1, pageSize = 200): Promise<PaginatedStores> {
  const response = await client.get<PaginatedStores>('/api/v1/stores', {
    params: { page, page_size: pageSize },
  })
  return response.data
}
