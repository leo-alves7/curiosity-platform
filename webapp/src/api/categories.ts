import client from './client'
import type { CategoryResponse, PaginatedCategories } from '@/types/category'

export async function fetchCategories(): Promise<CategoryResponse[]> {
  const response = await client.get<PaginatedCategories>('/api/v1/categories')
  return response.data.items
}
