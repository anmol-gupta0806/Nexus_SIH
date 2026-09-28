import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Satellite, 
  Layers, 
  UploadCloud, 
  SlidersHorizontal, 
  BarChart3, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';
import api from '../../services/api';

export default function Navbar() {
  const location = useLocation();
  const [systemOnline, setSystemOnline] = useState(true);

  useEffect(() => {
    // Check backend health
    api.get('/health')
      .then(() => setSystemOnline(true))
      .catch(() => setSystemOnline(false));
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: BarChart3 },
    { name: 'Enhance & Upload', path: '/upload', icon: UploadCloud },
    { name: 'Resolution Comparator', path: '/comparison', icon: SlidersHorizontal },
    { name: 'Validation & Uncertainty', path: '/validation', icon: ShieldCheck }
  ];

  return (
    <header className="glass-panel" style={{
      margin: '1.25rem 2.5rem 0',
      padding: '0.85rem 1.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: '1rem',
      zIndex: 100
    }}>
      {/* Brand */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--grad-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--glow-cyan)'
        }}>
          <Satellite size={22} color="#ffffff" />
        </div>
        <div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            NEXUS<span style={{ color: 'var(--accent-cyan)' }}>.SR</span>
          </span>
          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Sentinel-2 Super-Resolution
          </span>
        </div>
      </Link>

      {/* Nav Items */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-surface-hover)' : 'transparent',
                border: isActive ? '1px solid var(--border-glow)' : '1px solid transparent',
                transition: 'all var(--trans-fast)'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--accent-cyan)' : 'currentColor'} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className={systemOnline ? 'badge badge-emerald' : 'badge badge-rose'}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: systemOnline ? '#10b981' : '#f43f5e',
            boxShadow: systemOnline ? '0 0 8px #10b981' : '0 0 8px #f43f5e'
          }} />
          {systemOnline ? 'ENGINE READY' : 'OFFLINE'}
        </div>
      </div>
    </header>
  );
}
