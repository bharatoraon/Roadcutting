import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, Clock } from "lucide-react";

export default function AdminPanel({ onClose }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch applications
  const fetchApps = () => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => {
        // Handle GeoJSON format
        const apps = data.features.map((f) => f.properties);
        setApplications(apps.sort((a, b) => b.id - a.id));
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(
        `/api/applications/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (res.ok) {
        fetchApps(); // Refresh list
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "var(--bg-overlay)",
        backdropFilter: "blur(5px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "800px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Admin Dashboard</h2>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Manage Road Cut Applications
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--glass-border)",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "12px" }}>ID</th>
                <th style={{ padding: "12px" }}>User</th>
                <th style={{ padding: "12px" }}>Purpose</th>
                <th style={{ padding: "12px" }}>Date Range</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ padding: "20px", textAlign: "center" }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app.id}
                    style={{ borderBottom: "1px solid var(--border-divider)" }}
                  >
                    <td style={{ padding: "12px" }}>#{app.id}</td>
                    <td style={{ padding: "12px" }}>{app.user_name}</td>
                    <td style={{ padding: "12px" }}>{app.purpose}</td>
                    <td style={{ padding: "12px" }}>
                      {app.start_date
                        ? new Date(app.start_date).toLocaleDateString()
                        : "N/A"}{" "}
                      - <br />
                      {app.end_date
                        ? new Date(app.end_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      {app.status === "pending" && (
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => updateStatus(app.id, "approved")}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "none",
                              background: "var(--accent-secondary)",
                              color: "var(--bg-main)",
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, "rejected")}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: `1px solid var(--danger-border)`,
                              background: "transparent",
                              color: "var(--danger-text)",
                              cursor: "pointer",
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {app.status !== "pending" && (
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                          }}
                        >
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: {
      bg: "rgba(234, 179, 8, 0.2)",
      color: "#facc15",
      icon: <Clock size={14} />,
    },
    approved: {
      bg: "rgba(16, 185, 129, 0.2)",
      color: "#34d399",
      icon: <CheckCircle size={14} />,
    },
    rejected: {
      bg: "rgba(239, 68, 68, 0.2)",
      color: "#f87171",
      icon: <AlertTriangle size={14} />,
    },
  };
  const s = styles[status] || styles.pending;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "20px",
        background: s.bg,
        color: s.color,
        fontSize: "0.85rem",
        textTransform: "capitalize",
      }}
    >
      {s.icon} {status}
    </span>
  );
}
