import React from "react";
import {
  Map,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Sun,
  Moon,
  Car,
  Navigation,
  Shield,
  LogIn,
  LogOut,
} from "lucide-react";
import SearchBox from "./SearchBox";

export default function Sidebar({
  selectedRoad,
  address,
  onApply,
  onInspect,
  onNavigate,
  onOpenAdmin,
  theme,
  onToggleTheme,
  onSearch,
  showTraffic,
  onToggleTraffic,
  user,
  onLogin,
}) {
  return (
    <div
      className="glass-panel"
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        width: "350px",
        height: "calc(100vh - 70px)", // Increased bottom gap to clear Mapbox logo
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        color: "var(--text-primary)", // Use var
        transition: "color 0.3s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "20px",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Replaced Icon/Text with Custom Logo */}
          <img
            src={theme === "dark" ? "/Cwork-d.svg" : "/Cwork-l.svg"}
            alt="C-Work Logo"
            style={{ height: "28px", objectFit: "contain" }} // Administered height to fit sidebar
          />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {user ? (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-primary)",
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          ) : (
            <button
              onClick={onLogin}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-primary)",
              }}
              title="Login"
            >
              <LogIn size={18} />
            </button>
          )}
          <button
            onClick={() => {
              if (!user) {
                onLogin();
              } else {
                onOpenAdmin();
              }
            }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-primary)",
            }}
            title="Admin Dashboard"
          >
            <Shield size={18} />
          </button>
          <button
            onClick={onToggleTheme}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-primary)",
            }}
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Smart Search */}
      <SearchBox onPlaceSelected={onSearch} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {!selectedRoad ? (
          <div
            className="animate-fade-in"
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--text-secondary)",
            }}
          >
            <Info size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
            <p>
              Select a road on the map to view details or apply for a road cut
              permission.
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <h2
              style={{
                fontSize: "1.1rem",
                marginBottom: "16px",
                color: "var(--accent-primary)",
              }}
            >
              Selected Asset
            </h2>
            <div style={{ display: "grid", gap: "12px", marginBottom: "24px" }}>
              <InfoRow label="Road Name" value={selectedRoad.name} />
              <InfoRow label="Location" value={address || "Loading..."} />
              <InfoRow label="Owner" value={selectedRoad.owner} />
              <InfoRow label="Surface" value={selectedRoad.surface_type} />
              <InfoRow label="Asset ID" value={`#${selectedRoad.id}`} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <button
                className="btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                onClick={() => onApply(selectedRoad)}
              >
                <FileText size={18} />
                Apply
              </button>

              <button
                className="btn-primary"
                style={{
                  background: "var(--btn-secondary)",
                  border: "none",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                onClick={() => onInspect && onInspect(selectedRoad)}
              >
                <Map size={18} />
                Inspect
              </button>

              <button
                className="btn-primary"
                style={{
                  gridColumn: "1 / -1",
                  background: "var(--btn-tertiary)",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  border: "none",
                }}
                onClick={onNavigate}
              >
                <Navigation size={18} />
                Field Navigation (Directions)
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "auto",
          paddingTop: "20px",
          borderTop: "1px solid var(--glass-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
          }}
        >
          <span>System Status</span>
          <span
            style={{
              color: "var(--accent-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                background: "currentColor",
                borderRadius: "50%",
              }}
            ></span>
            Online
          </span>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start",
        gap: "12px",
        padding: "8px 0",
        borderBottom: "1px solid var(--border-divider)",
      }}
    >
      <span
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.9rem",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontWeight: 500,
          textAlign: "right",
          wordBreak: "break-word",
          fontSize: "0.95rem",
          lineHeight: "1.4",
        }}
      >
        {value}
      </span>
    </div>
  );
}
