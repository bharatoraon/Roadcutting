import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView({
  onSelectRoad,
  theme,
  flyToLocation,
  layers,
  clickedLocation,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const clickMarker = useRef(null); // Ref to store the current click marker
  const [lng, setLng] = useState(80.2707);
  const [lat, setLat] = useState(13.0827);
  const [zoom, setZoom] = useState(12);

  // Handle Click Marker
  useEffect(() => {
    if (!map.current || !clickedLocation) return;

    // Remove existing marker
    if (clickMarker.current) {
      clickMarker.current.remove();
    }

    // Add new marker
    clickMarker.current = new mapboxgl.Marker({ color: "#ef4444" }) // Red color
      .setLngLat([clickedLocation.lng, clickedLocation.lat])
      .addTo(map.current);
  }, [clickedLocation]);

  // Store regions data for filtering
  const [regionsData, setRegionsData] = useState(null);

  // Handle Layer Visibility
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const toggle = (id, visible) => {
      if (map.current.getLayer(id)) {
        map.current.setLayoutProperty(
          id,
          "visibility",
          visible ? "visible" : "none",
        );
      }
    };

    toggle("roads-layer", layers.roads);
    toggle("regions-layer", layers.regions);
    toggle("wards-layer", layers.wards);
    toggle("wards-outline", layers.wards);
    toggle("applications-layer", layers.applications);

    // Special handling for Traffic (Source/Layer addition)
    if (layers.traffic) {
      if (!map.current.getSource("traffic")) {
        map.current.addSource("traffic", {
          type: "vector",
          url: "mapbox://mapbox.mapbox-traffic-v1",
        });
        map.current.addLayer(
          {
            id: "traffic-layer",
            type: "line",
            source: "traffic",
            "source-layer": "traffic",
            paint: {
              "line-width": 2,
              "line-color": [
                "match",
                ["get", "congestion"],
                "low",
                "#4ade80",
                "moderate",
                "#facc15",
                "heavy",
                "#f87171",
                "severe",
                "#dc2626",
                "#000000",
              ],
            },
          },
          "roads-layer",
        ); // Place below roads
      }

      // Apply Boundary Filter if regions data exists
      if (regionsData) {
        try {
          // Collect all Polygon/MultiPolygon coordinates
          const allCoordinates = [];

          regionsData.features.forEach((f) => {
            if (f.geometry.type === "Polygon") {
              allCoordinates.push(f.geometry.coordinates);
            } else if (f.geometry.type === "MultiPolygon") {
              f.geometry.coordinates.forEach((polyCoords) => {
                allCoordinates.push(polyCoords);
              });
            }
          });

          if (allCoordinates.length > 0) {
            const multiPoly = {
              type: "MultiPolygon",
              coordinates: allCoordinates,
            };

            // Check if the filter is already applied to avoid redundancy?
            // Mapbox is efficient, we can just set it.
            map.current.setFilter("traffic-layer", ["within", multiPoly]);
          }
        } catch (e) {
          console.error("Error applying traffic filter:", e);
        }
      }
    } else {
      if (map.current.getLayer("traffic-layer"))
        map.current.removeLayer("traffic-layer");
      if (map.current.getSource("traffic")) map.current.removeSource("traffic");
    }
  }, [layers, regionsData]); // Re-run when regionsData loads

  // Handle Smart Search flyTo
  useEffect(() => {
    if (map.current && flyToLocation) {
      map.current.flyTo({
        center: [flyToLocation.lng, flyToLocation.lat],
        zoom: flyToLocation.zoom || 16,
        essential: true, // This animation is considered essential with respect to prefers-reduced-motion
      });
      // Optional: Helper marker
      new mapboxgl.Marker({ color: "red" })
        .setLngLat([flyToLocation.lng, flyToLocation.lat])
        .addTo(map.current);
    }
  }, [flyToLocation]);

  // Update map style when theme changes
  useEffect(() => {
    if (!map.current) return;
    const styleUrl =
      theme === "dark"
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";
    map.current.setStyle(styleUrl);
    // Note: setStyle removes layers, so we need to reload them.
    // Mapbox fires 'style.load' when the new style is ready.
    map.current.once("style.load", () => {
      loadLayers();
    });
  }, [theme]);

  useEffect(() => {
    if (map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11", // Default
      center: [lng, lat],
      zoom: zoom,
    });

    // ... keep existing listeners but move click to ref if needed or ensure it persists
    // Actually, listeners persist on the map instance usually, but layers are gone.

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    map.current.on("load", () => {
      loadLayers();
    });

    map.current.on("click", (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ["roads-layer"],
      });
      if (features.length > 0) {
        // Pass merged properties AND geometry
        const feature = features[0];
        const roadData = {
          ...feature.properties,
          geometry: feature.geometry,
        };
        onSelectRoad(roadData, { lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    });
  }, []);

  const loadLayers = () => {
    // 1. REGIONS BOUNDARY (Bottom Layer)
    fetch("/api/boundaries/regions")
      .then((res) => res.json())
      .then((data) => {
        setRegionsData(data); // Save for traffic filtering filters
        if (!map.current.getSource("regions")) {
          map.current.addSource("regions", { type: "geojson", data: data });
          map.current.addLayer({
            id: "regions-layer",
            type: "line",
            source: "regions",
            layout: {},
            paint: {
              "line-color": "#fb923c", // More professional orange
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 2, // Thinner at low zoom
                16, 5  // Thicker at high zoom
              ],
            },
          });
        }
      })
      .catch((err) => console.error("Error loading regions:", err));

    // 2. WARDS BOUNDARY
    fetch("/api/boundaries/wards")
      .then((res) => res.json())
      .then((data) => {
        if (!map.current.getSource("wards")) {
          map.current.addSource("wards", { type: "geojson", data: data });
          map.current.addLayer({
            id: "wards-layer",
            type: "fill",
            source: "wards",
            layout: {},
            paint: {
              "fill-color": "#60a5fa", // Softer blue
              "fill-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 0.15, // More visible at low zoom
                16, 0.05  // Less visible at high zoom
              ],
              "fill-outline-color": "rgba(96, 165, 250, 0.5)",
            },
          });
          // Add line layer for sharper ward boundaries
          map.current.addLayer({
            id: "wards-outline",
            type: "line",
            source: "wards",
            layout: {},
            paint: {
              "line-color": "#60a5fa",
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 1.5,
                16, 3
              ],
              "line-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 0.6,
                16, 0.2
              ],
            },
          });
        }
      })
      .catch((err) => console.error("Error loading wards:", err));

    // 3. ROADS (Top Layer)
    fetch("/api/roads")
      .then((res) => res.json())
      .then((data) => {
        if (!map.current.getSource("roads")) {
          map.current.addSource("roads", {
            type: "geojson",
            data: data,
          });
          map.current.addLayer({
            id: "roads-layer",
            type: "line",
            source: "roads",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": [
                "match",
                ["get", "owner"],
                "GCC",
                "#34d399",     // Fresh green
                "Highways",
                "#38bdf8",     // Bright blue
                "CMRL",
                "#fbbf24",     // Golden amber
                "#94a3b8"      // Slate gray fallback
              ],
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 0.5,    // Very thin at low zoom showing just a network
                14, 2,      // Medium width at mid zoom
                18, 12,     // Wide at street level representing width
              ],
              "line-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 0.4,    // Faded at low zoom
                14, 0.8,
                18, 1.0     // Solid at high zoom
              ],
            },
          });
        }
      })
      .catch((err) => console.error("Error loading roads:", err));

    // 4. APPLICATIONS
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => {
        if (!map.current.getSource("applications")) {
          map.current.addSource("applications", {
            type: "geojson",
            data: data,
          });
          map.current.addLayer({
            id: "applications-layer",
            type: "line",
            source: "applications",
            paint: {
              "line-color": [
                "match",
                ["get", "status"],
                "approved",
                "#10b981", // Green
                "rejected",
                "#64748b", // Gray
                "#ef4444", // Default/Pending = Red
              ],
              "line-width": 4,
              "line-dasharray": [2, 1],
              "line-opacity": 1,
            },
          });
        }
      })
      .catch((err) => console.error("Error loading applications:", err));
  };

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
}
