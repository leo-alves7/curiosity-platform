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
