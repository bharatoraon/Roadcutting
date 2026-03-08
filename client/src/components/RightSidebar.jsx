import React from 'react';
import { Layers, Activity, Map as MapIcon, Grid, Car, FileText } from 'lucide-react';

export default function RightSidebar({ layers, onToggleLayer }) {

    const layerConfig = [
        { id: 'roads', label: 'Road Network', icon: <MapIcon size={18} /> },
        { id: 'regions', label: 'Zones', icon: <Activity size={18} /> },
        { id: 'wards', label: 'Wards', icon: <Grid size={18} /> },
        { id: 'applications', label: 'Road Cuts', icon: <FileText size={18} /> },
        { id: 'traffic', label: 'Live Traffic', icon: <Car size={18} /> },
    ];

    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '250px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            color: 'var(--text-primary)',
            transition: 'color 0.3s'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                <Layers size={20} color="var(--accent-primary)" />
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Map Layers</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {layerConfig.map(layer => (
                    <div
                        key={layer.id}
                        onClick={() => onToggleLayer(layer.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px',
                            background: layers[layer.id] ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            borderRadius: '8px',
                            border: layers[layer.id] ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: layers[layer.id] ? 1 : 0.6 }}>
                            {layer.icon}
                            <span style={{ fontSize: '0.9rem' }}>{layer.label}</span>
                        </div>
                        <div style={{
                            width: '36px',
                            height: '20px',
                            background: layers[layer.id] ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)',
                            borderRadius: '10px',
                            position: 'relative',
                            transition: 'background 0.3s'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '2px',
                                left: layers[layer.id] ? '18px' : '2px',
                                width: '16px',
                                height: '16px',
                                background: 'white',
                                borderRadius: '50%',
                                transition: 'left 0.3s'
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
