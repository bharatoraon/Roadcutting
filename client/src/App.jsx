import React, { useState, useEffect } from "react";
import MapView from "./components/Map";
import Sidebar from "./components/Sidebar";
import RequestForm from "./components/RequestForm";
import StreetViewModal from "./components/StreetViewModal";
import RightSidebar from "./components/RightSidebar";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";

function App() {
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStreetViewOpen, setIsStreetViewOpen] = useState(false);
  const [streetViewLocation, setStreetViewLocation] = useState(null);

  const [clickedLocation, setClickedLocation] = useState(null);
  const [selectedRoadAddress, setSelectedRoadAddress] = useState(null);

  // Feature 1: Smart Search
  const [flyToLocation, setFlyToLocation] = useState(null);

  // Feature 4: Layer Control
  const [layers, setLayers] = useState({
    roads: true,
    regions: true,
    wards: false,
    applications: true,
    traffic: false,
  });

  const toggleLayer = (layerId) => {
    setLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  const [theme, setTheme] = useState("dark");

  // Auth state
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Optionally verify token, but for now assume valid
      // You can add a /me endpoint to verify
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleSearch = (place) => {
    setFlyToLocation({ lat: place.lat, lng: place.lng, zoom: 16 });
  };

  const handleSelectRoad = (roadProperties, lngLat) => {
    setSelectedRoad(roadProperties);
    setClickedLocation(lngLat);

    // Feature 2: Reverse Geocoding
    setSelectedRoadAddress("Fetching address...");
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: lngLat }, (results, status) => {
        if (status === "OK" && results[0]) {
          const cleanAddress = results[0].formatted_address
            .replace(", Chennai, Tamil Nadu", "")
            .replace(", India", "");
          setSelectedRoadAddress(cleanAddress);
        } else {
          setSelectedRoadAddress("Address not found");
        }
      });
    }
  };

  const handleApply = () => {
    if (!user) {
      setIsLoginOpen(true);
    } else {
      setIsFormOpen(true);
    }
  };

  const handleInspect = () => {
    if (clickedLocation) {
      setStreetViewLocation(clickedLocation);
      setIsStreetViewOpen(true);
    } else {
      setStreetViewLocation({ lat: 13.0827, lng: 80.2707 });
      setIsStreetViewOpen(true);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert(
          "Application Submitted Successfully! ID: " +
            (await response.json()).id,
        );
        setIsFormOpen(false);
        window.location.reload();
      } else {
        alert("Submission failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  const handleNavigate = () => {
    if (clickedLocation) {
      const { lat, lng } = clickedLocation;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        "_blank",
      );
    } else {
      alert("Please select a location on the map first.");
    }
  };

  return (
    <div
      className="App"
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "var(--bg-main)",
        color: "var(--text-primary)",
      }}
    >
      <MapView
        onSelectRoad={handleSelectRoad}
        theme={theme}
        flyToLocation={flyToLocation}
        layers={layers}
        clickedLocation={clickedLocation}
      />

      <Sidebar
        selectedRoad={selectedRoad}
        address={selectedRoadAddress}
        onApply={handleApply}
        onInspect={handleInspect}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setIsAdminOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSearch={handleSearch}
        user={user}
        onLogin={() => setIsLoginOpen(true)}
      />

      <RightSidebar layers={layers} onToggleLayer={toggleLayer} />

      {isFormOpen && selectedRoad && (
        <RequestForm
          road={selectedRoad}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}

      {isStreetViewOpen && (
        <StreetViewModal
          location={streetViewLocation}
          onClose={() => setIsStreetViewOpen(false)}
        />
      )}

      {isLoginOpen && (
        <Login onClose={() => setIsLoginOpen(false)} onLogin={setUser} />
      )}
    </div>
  );
}

export default App;
