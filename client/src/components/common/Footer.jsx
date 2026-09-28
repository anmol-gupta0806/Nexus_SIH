import React from 'react';
import { Satellite, Shield, Cpu, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      padding: '2rem 2.5rem',
      backgroundColor: 'rgba(7, 10, 18, 0.85)',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Satellite size={18} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <strong>Nexus SR Framework</strong> • Sentinel-2 Earth Observation Generative Super-Resolution
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Cpu size={14} color="var(--accent-emerald)" />
            Inference Target: &lt;4.0m Ground Sampling Distance
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Shield size={14} color="var(--accent-purple)" />
            Spectral & Uncertainty Guardrails Active
          </span>
        </div>
      </div>
    </footer>
  );
}
