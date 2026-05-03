import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import maplibregl from 'maplibre-gl'
import StorePopup from './StorePopup'
import type { StoreResponse } from '@/types/store'

export function createStorePopup(
  store: StoreResponse,
  categoryMap: Record<string, string>,
  onViewDetails: (storeId: string) => void,
): maplibregl.Popup {
  const el = document.createElement('div')
  const root = createRoot(el)
  root.render(
    createElement(StorePopup, {
      store,
      categoryName: categoryMap[store.category_id ?? ''],
      onViewDetails,
    }),
  )
  return new maplibregl.Popup({ offset: 25 }).setDOMContent(el)
}
