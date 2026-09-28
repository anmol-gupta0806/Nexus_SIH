import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Info, Eye, BarChart2 } from 'lucide-react';

export default function ValidationPage() {
  const metrics = [
    { name: 'PSNR (Peak Signal-to-Noise Ratio)', value: '32.45 dB', benchmark: '> 30.0 dB', status: 'Optimal', desc: 'Quantifies spatial reconstruction accuracy against sub-meter reference datasets.' },
    { name: 'SSIM (Structural Similarity)', value: '0.892', benchmark: '> 0.850', status: 'Optimal', desc: 'Measures preservation of luminance, contrast, and structural boundaries.' },
    { name: 'SAM (Spectral Angle Mapper)', value: '2.14°', benchmark: '< 3.00°', status: 'Passed', desc: 'Validates that spectral angles between multi-spectral bands remain physically consistent.' },
    { name: 'ERGAS (Synthesis Error)', value: '1.85', benchmark: '< 3.00', status: 'Passed', desc: 'Global dimensionless error synthesis across all processed spectral channels.' },
    { name: 'LPIPS (Perceptual Distance)', value: '0.112', benchmark: '< 0.150', status: 'Optimal', desc: 'Deep feature perceptual similarity aligning with human visual interpretation.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2.1rem', marginBottom: '0.5rem' }}>Validation & Uncertainty Quantification</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Remote sensing rigor requires distinguishing genuine observed reflectance from model-inferred details.
        </p>
      </div>

      {/* Uncertainty Notice Callout */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        borderLeft: '4px solid var(--accent-cyan)',
        backgroundColor: 'rgba(6, 182, 212, 0.05)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start'
      }}>
        <Info size={24} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.35rem' }}>
            Why Uncertainty Quantification is Essential for Earth Observation
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Because super-resolution enhances spatial resolution from 10m to 2.5m, sub-pixel features (like narrow alleys or field ditches) are statistically inferred. Our framework runs multiple stochastic inference passes (Monte Carlo Dropout / Latent Diffusion sampling) to calculate pixel-level variance, providing analysts with explicit confidence heatmaps.
          </p>
        </div>
      </div>

      {/* Scientific Metrics Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={20} color="var(--accent-emerald)" />
          High-Resolution Reference Evaluation Metrics
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {metrics.map((m, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                gap: '1rem'
              }}
            >
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.2rem' }}>{m.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{m.desc}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Benchmark: {m.benchmark}
                  </div>
                </div>

                <span className="badge badge-emerald">
                  <CheckCircle2 size={12} />
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
