import React, { useState } from 'react';
import { X, Calendar, AlertTriangle } from 'lucide-react';

export default function RequestForm({ road, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        purpose: '',
        start_date: '',
        end_date: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            geometry: road.geometry // Simplified: using the whole road geometry for now
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--bg-overlay)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="glass-panel animate-fade-in" style={{ width: '500px', padding: '32px', position: 'relative', background: 'var(--bg-modal)' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginTop: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    New Excavation Request
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Application for {road.name} ({road.owner})
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Purpose of Work</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Broken Pipe Repair"
                            required
                            value={formData.purpose}
                            onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Start Date</label>
                            <input
                                type="date"
                                className="input-field"
                                required
                                value={formData.start_date}
                                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>End Date</label>
                            <input
                                type="date"
                                className="input-field"
                                required
                                value={formData.end_date}
                                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px' }}>
                        <AlertTriangle size={20} color="var(--accent-danger)" />
                        <div style={{ fontSize: '0.85rem', color: 'var(--danger-text)' }}>
                            <strong>Caution:</strong> Unauthorized excavation invokes automatic penalty under GCC Act Sec 213. Digital approval mandatory.
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                        Submit Application
                    </button>
                </form>
            </div>
        </div>
    );
}
