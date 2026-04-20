import client from './client'
import type { PaginatedStores, StoreCreate, StoreResponse, StoreUpdate } from '@/types/store'

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

export async function createStore(data: StoreCreate): Promise<StoreResponse> {
  const response = await client.post<StoreResponse>('/api/v1/stores', data)
  return response.data
}

export async function updateStore(id: string, data: StoreUpdate): Promise<StoreResponse> {
  const response = await client.put<StoreResponse>(`/api/v1/stores/${id}`, data)
  return response.data
}

export async function deleteStore(id: string): Promise<void> {
  await client.delete(`/api/v1/stores/${id}`)
}

export async function uploadStoreImage(id: string, file: File): Promise<StoreResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await client.post<StoreResponse>(`/api/v1/stores/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function fetchAdminStores(page = 1, pageSize = 200): Promise<PaginatedStores> {
  const response = await client.get<PaginatedStores>('/api/v1/admin/stores', {
    params: { page, page_size: pageSize },
  })
  return response.data
}

export async function toggleStoreActive(id: string): Promise<StoreResponse> {
  const response = await client.post<StoreResponse>(`/api/v1/admin/stores/${id}/toggle-active`)
  return response.data
}
