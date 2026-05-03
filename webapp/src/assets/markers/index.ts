import restaurantMarker from './restaurant.svg'
import pharmacyMarker from './pharmacy.svg'
import gasStationMarker from './gas_station.svg'
import marketMarker from './market.svg'
import defaultMarker from './default.svg'

// Maps category slug → marker SVG URL.
// Replace placeholder SVGs with branded designs before production release (see DECISIONS.md ADR-012).
// Integrating these into the MapLibre unclustered-point layer is tracked separately (CSTY-25).
export const categoryMarkers: Record<string, string> = {
  restaurant: restaurantMarker,
  pharmacy: pharmacyMarker,
  gas_station: gasStationMarker,
  market: marketMarker,
  default: defaultMarker,
}
