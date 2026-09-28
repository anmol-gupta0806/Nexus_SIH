import React, { useState, useRef } from 'react';
import { 
  SlidersHorizontal, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles,
  Info,
  Layers
} from 'lucide-react';

export default function ComparisonPage() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showUncertainty, setShowUncertainty] = useState(false);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Controls Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Resolution Comparison Viewer</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Interactive comparison between Original 10m Sentinel-2 and 2.5m Super-Resolved Output.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Zoom controls */}
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '0.25rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.45rem', border: 'none' }}
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <span style={{ fontSize: '0.8rem', padding: '0 0.5rem', fontFamily: 'var(--font-mono)' }}>
              {(zoomLevel * 100).toFixed(0)}%
            </span>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.45rem', border: 'none' }}
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.45rem', border: 'none' }}
              onClick={() => setZoomLevel(1)}
              title="Reset Zoom"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <button 
            className={`btn ${showUncertainty ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowUncertainty(!showUncertainty)}
          >
            <Layers size={16} />
            {showUncertainty ? 'Hide Uncertainty' : 'Uncertainty Map'}
          </button>

          <button className="btn btn-primary" id="btn-download-geotiff">
            <Download size={16} />
            Export GeoTIFF (2.5m)
          </button>
        </div>
      </div>

      {/* Main Interactive Split-Screen Stage */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={{
          position: 'relative',
          width: '100%',
          height: '620px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          cursor: 'ew-resize',
          userSelect: 'none',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
          backgroundColor: '#05070e'
        }}
      >
        {/* Synthetic high-detail satellite representation */}
        {/* Right side: 2.5m High Resolution Enhanced View */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0e1e2d 0%, #15312a 50%, #18233c 100%)',
          backgroundImage: `
            radial-gradient(ellipse at 40% 50%, rgba(16, 185, 129, 0.45) 0%, transparent 60%),
            radial-gradient(ellipse at 75% 30%, rgba(6, 182, 212, 0.35) 0%, transparent 50%),
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 16px 16px, 16px 16px'
        }}>
          {/* Simulated enhanced roads and boundaries */}
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Fine agricultural field boundaries */}
            <rect x="15%" y="20%" width="22%" height="32%" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
            <rect x="40%" y="18%" width="28%" height="24%" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.9" />
            <rect x="42%" y="45%" width="24%" height="30%" fill="none" stroke="#059669" strokeWidth="1.5" opacity="0.85" />
            
            {/* Sharp secondary road network (sub-4m feature) */}
            <path d="M 50 150 Q 300 220 550 180 T 950 320" fill="none" stroke="#f1f5f9" strokeWidth="3" opacity="0.95" />
            <path d="M 320 200 L 480 550" fill="none" stroke="#e2e8f0" strokeWidth="2.5" opacity="0.9" />
            <path d="M 550 180 L 720 480" fill="none" stroke="#cbd5e1" strokeWidth="2" opacity="0.85" />

            {/* Reconstructed urban building footprints */}
            <rect x="48%" y="25%" width="24" height="24" fill="#38bdf8" opacity="0.8" rx="2" />
            <rect x="52%" y="27%" width="30" height="20" fill="#38bdf8" opacity="0.8" rx="2" />
            <rect x="50%" y="33%" width="20" height="28" fill="#38bdf8" opacity="0.8" rx="2" />
          </svg>
        </div>

        {/* Left side: 10m Low Resolution Input View (Clipped via slider) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${sliderPosition}%`,
          overflow: 'hidden',
          borderRight: '2px solid #ffffff',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.9)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100vw',
            height: '100%',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease-out',
            background: 'linear-gradient(135deg, #0e1e2d 0%, #15312a 50%, #18233c 100%)',
            filter: 'blur(5px) contrast(85%)', // Simulates 10m medium-resolution optical blur
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              <path d="M 50 150 Q 300 220 550 180 T 950 320" fill="none" stroke="#f1f5f9" strokeWidth="12" opacity="0.5" />
              <path d="M 320 200 L 480 550" fill="none" stroke="#e2e8f0" strokeWidth="10" opacity="0.5" />
            </svg>
          </div>
        </div>

        {/* Divider Slider Handle */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${sliderPosition}%`,
          transform: 'translate(-50%, -50%)',
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 15px rgba(0, 0, 0, 0.8), 0 0 20px rgba(6, 182, 212, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'ew-resize',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <SlidersHorizontal size={20} color="#070a12" />
        </div>

        {/* Overlay Labels */}
        <div style={{
          position: 'absolute',
          top: '1.25rem',
          left: '1.25rem',
          backgroundColor: 'rgba(7, 10, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '0.45rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          pointerEvents: 'none',
          zIndex: 5
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Input Satellite Band</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Sentinel-2 (10m GSD)</div>
        </div>

        <div style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          backgroundColor: 'rgba(7, 10, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '0.45rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-glow)',
          pointerEvents: 'none',
          zIndex: 5
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={12} /> AI Super-Resolved
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Nexus Output (2.5m GSD)</div>
        </div>
      </div>

      {/* Analytical Metadata Bar */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.75rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Target Coordinate System</span>
          <span style={{ fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>EPSG:32643 (WGS 84 / UTM Zone 43N)</span>
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Spectral SAM Metric</span>
          <span style={{ fontWeight: 600, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>2.14° (High Consistency)</span>
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Peak SNR</span>
          <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>32.45 dB (+6.8 dB gain)</span>
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Reconstructed Spatial GSD</span>
          <span style={{ fontWeight: 600, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>2.50 meters/pixel</span>
        </div>
      </div>
    </div>
  );
}
