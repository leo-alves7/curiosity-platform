import type maplibregl from 'maplibre-gl'

export const STORES_SOURCE_ID = 'stores'
export const CLUSTERS_LAYER_ID = 'clusters'
export const CLUSTER_COUNT_LAYER_ID = 'cluster-count'
export const UNCLUSTERED_LAYER_ID = 'unclustered-point'

export function getClusterLayerDefs(): maplibregl.LayerSpecification[] {
  return [
    {
      id: CLUSTERS_LAYER_ID,
      type: 'circle',
      source: STORES_SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#22c55e', 10, '#f97316', 50, '#ef4444'],
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    },
    {
      id: CLUSTER_COUNT_LAYER_ID,
      type: 'symbol',
      source: STORES_SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 13,
      },
      paint: {
        'text-color': '#fff',
      },
    },
    {
      id: UNCLUSTERED_LAYER_ID,
      type: 'symbol',
      source: STORES_SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': [
          'coalesce',
          ['image', ['concat', 'category:', ['get', 'category_slug']]],
          ['image', 'category:default'],
        ],
        'icon-size': 0.7,
        'icon-allow-overlap': true,
        'icon-anchor': 'bottom',
      },
    },
  ]
}
