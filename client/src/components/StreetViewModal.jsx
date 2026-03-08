import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function StreetViewModal({ location, onClose }) {
    const panoRef = useRef(null);

    const [error, setError] = React.useState(null);

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 10;

        const initStreetView = () => {
            if (!window.google) {
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(initStreetView, 500); // Retry every 500ms
                } else {
                    setError("Google Maps API failed to load. Please check your internet connection.");
                }
                return;
            }

            const panorama = new window.google.maps.StreetViewPanorama(
                panoRef.current,
                {
                    position: location,
                    pov: { heading: 34, pitch: 10 },
                    zoom: 1,
                    visible: false
                }
            );

            const sv = new window.google.maps.StreetViewService();
            sv.getPanorama({ location: location, radius: 100 }, (data, status) => {
                if (status === "OK") {
                    panorama.setPano(data.location.pano);
                    panorama.setPov({ heading: 270, pitch: 0 });
                    panorama.setVisible(true);
                    setError(null);
                } else {
                    setError("No Street View data available for this specific location.");
                    console.warn("Street View status:", status);
                }
            });
        };

        initStreetView();
    }, [location]);

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--bg-overlay)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }}>
            <div className="glass-panel" style={{ width: '80%', height: '80%', position: 'relative', background: 'var(--bg-main)', padding: 0, overflow: 'hidden' }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'var(--bg-overlay)',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        zIndex: 10
                    }}
                >
                    <X size={24} />
                </button>
                <div ref={panoRef} style={{ width: '100%', height: '100%' }} />
                {error && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'var(--text-primary)',
                        background: 'var(--bg-overlay)',
                        padding: '20px',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <AlertTriangle size={32} color="#f87171" style={{ marginBottom: '10px' }} />
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
