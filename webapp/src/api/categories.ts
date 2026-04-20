import client from './client'
import type { CategoryResponse } from '@/types/category'

export async function fetchCategories(): Promise<CategoryResponse[]> {
  const response = await client.get<CategoryResponse[]>('/api/v1/categories')
  return response.data
}
