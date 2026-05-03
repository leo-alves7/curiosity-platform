import { useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import type { CategoryResponse } from '@/types/category'
import { categoryMarkers } from '@/assets/markers'

export function useMapImageLoader(
  map: maplibregl.Map | null,
  categories: CategoryResponse[],
): void {
  useEffect(() => {
    if (!map || categories.length === 0) return

    const registerImages = () => {
      const toRegister = [
        ...categories.map((cat) => ({
          name: `category:${cat.slug}`,
          url: categoryMarkers[cat.slug] ?? categoryMarkers['default'],
        })),
        { name: 'category:default', url: categoryMarkers['default'] },
      ]

      for (const { name, url } of toRegister) {
        if (map.hasImage(name)) continue
        const img = new Image()
        img.onload = () => {
          if (!map.hasImage(name)) {
            map.addImage(name, img)
          }
        }
        img.src = url
      }
    }

    if (map.isStyleLoaded()) {
      registerImages()
    } else {
      map.once('load', registerImages)
    }

    map.on('styledata', registerImages)

    return () => {
      map.off('styledata', registerImages)
      map.off('load', registerImages)
    }
  }, [map, categories])
}
