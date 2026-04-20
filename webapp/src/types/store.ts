export interface StoreResponse {
  id: string
  name: string
  description: string | null
  address: string | null
  lat: number | null
  lng: number | null
  category_id: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PaginatedStores {
  items: StoreResponse[]
  total: number
  page: number
  page_size: number
}
