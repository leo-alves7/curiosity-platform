import client from './client'
import type {
  CategoryCreate,
  CategoryResponse,
  CategoryUpdate,
  PaginatedCategories,
} from '@/types/category'

export async function fetchCategories(): Promise<CategoryResponse[]> {
  const response = await client.get<PaginatedCategories>('/api/v1/categories')
  return response.data.items
}

export async function createCategory(data: CategoryCreate): Promise<CategoryResponse> {
  const response = await client.post<CategoryResponse>('/api/v1/categories', data)
  return response.data
}

export async function updateCategory(id: string, data: CategoryUpdate): Promise<CategoryResponse> {
  const response = await client.put<CategoryResponse>(`/api/v1/categories/${id}`, data)
  return response.data
}

export async function deleteCategory(id: string): Promise<void> {
  await client.delete(`/api/v1/categories/${id}`)
}
