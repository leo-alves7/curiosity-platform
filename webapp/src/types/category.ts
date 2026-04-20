import type { StoreResponse } from './store'

export interface CategoryResponse {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  created_at: string
  updated_at: string
  stores?: StoreResponse[]
}

export interface CategoryCreate {
  name: string
  slug: string
  icon?: string | null
  color?: string | null
}

export interface CategoryUpdate {
  name?: string | null
  slug?: string | null
  icon?: string | null
  color?: string | null
}

export interface PaginatedCategories {
  items: CategoryResponse[]
  total: number
  page: number
  page_size: number
}
