import React, { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export default function SearchBox({ onPlaceSelected }) {
    const inputRef = useRef(null);
    const autoCompleteRef = useRef(null);

    useEffect(() => {
        if (!window.google || !window.google.maps || !window.google.maps.places) return;

        autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: "in" }, // Restrict to India
            fields: ["geometry", "name"],
        });

        autoCompleteRef.current.addListener("place_changed", () => {
            const place = autoCompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                onPlaceSelected({ lat, lng, name: place.name });
            }
        });
    }, [onPlaceSelected]);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <Search
                size={18}
                style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                    zIndex: 1
                }}
            />
            <input
                ref={inputRef}
                type="text"
                placeholder="Search Chennai locations..."
                className="input-field"
                style={{
                    paddingLeft: '40px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--glass-border)'
                }}
            />
        </div>
    );
}
