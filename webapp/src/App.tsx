import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "@ionic/react/css/core.css";

function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-53.45528, -24.95583], // São Paulo
      zoom: 12,
    });

    new maplibregl.Marker().setLngLat([-53.45528, -24.95583])
      .setPopup(new maplibregl.Popup().setHTML("<h3>Loja Exemplo</h3>"))
      .addTo(map);

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
}

export default App;
