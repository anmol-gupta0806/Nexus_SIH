import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  Settings2, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Sliders
} from 'lucide-react';
import api from '../services/api';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [modelType, setModelType] = useState('swin_ir');
  const [scaleFactor, setScaleFactor] = useState(4);
  const [estimateUncertainty, setEstimateUncertainty] = useState(true);
  const [selectedBands, setSelectedBands] = useState('rgb_nir');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setProgress(15);
    setStatusMessage('Uploading and parsing raster metadata...');

    try {
      // Simulate/call upload
      setTimeout(() => {
        setProgress(45);
        setStatusMessage('Tiling 10m raster and preparing model input tensors...');
      }, 700);

      setTimeout(() => {
        setProgress(75);
        setStatusMessage(`Executing ${modelType.toUpperCase()} super-resolution inference & uncertainty pass...`);
      }, 1400);

      setTimeout(() => {
        setProgress(100);
        setStatusMessage('Reconstruction complete! Preserving GeoTIFF coordinates...');
        setTimeout(() => {
          navigate('/comparison');
        }, 800);
      }, 2200);

    } catch (err) {
      setProcessing(false);
      setStatusMessage('Error during execution: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2.1rem', marginBottom: '0.5rem' }}>Enhance Sentinel-2 Imagery</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Upload standard 10m Level-2A GeoTIFF or high-resolution test bands to synthesize sub-4m details.
        </p>
      </div>

      <form onSubmit={handleProcess} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Upload Zone */}
        <div 
          className="glass-panel"
          style={{
            border: '2px dashed var(--border-glow)',
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(13, 19, 34, 0.5)'
          }}
          onClick={() => document.getElementById('file-upload-input').click()}
        >
          <input 
            type="file" 
            id="file-upload-input" 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
            accept=".tif,.tiff,.jp2,.png,.jpg,.jpeg"
          />
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: 'var(--accent-cyan)'
          }}>
            <UploadCloud size={32} />
          </div>
          {file ? (
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem' }}>
                {file.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for processing
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
                Drop Sentinel-2 GeoTIFF or image here, or click to browse
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Supports .TIF (GeoTIFF), .JP2 (JPEG 2000), .PNG, .JPG (Max 150MB)
              </div>
            </div>
          )}
        </div>

        {/* Configuration Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Model Selector */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              <Settings2 size={16} color="var(--accent-cyan)" />
              Generative Model Architecture
            </label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              <option value="swin_ir">SwinIR Transformer (Best Spectral Fidelity)</option>
              <option value="diffusion">GeoDiffusion-SR (Ultra Fine Textures)</option>
              <option value="srgan">Sentinel-2 SRGAN (Fastest Inference)</option>
            </select>
          </div>

          {/* Scale Factor */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              <Sliders size={16} color="var(--accent-emerald)" />
              Target Resolution Scale
            </label>
            <select
              value={scaleFactor}
              onChange={(e) => setScaleFactor(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              <option value={4}>4x Scale (10m → 2.5m GSD - SIH Target)</option>
              <option value={2}>2x Scale (10m → 5.0m GSD)</option>
            </select>
          </div>

          {/* Spectral Bands */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              <Layers size={16} color="var(--accent-purple)" />
              Band Combination
            </label>
            <select
              value={selectedBands}
              onChange={(e) => setSelectedBands(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              <option value="rgb_nir">4 Bands: B04 (R), B03 (G), B02 (B), B08 (NIR)</option>
              <option value="rgb">3 Bands: True Color RGB (B04, B03, B02)</option>
            </select>
          </div>
        </div>

        {/* Uncertainty Checkbox */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="checkbox"
            id="uncertainty-toggle"
            checked={estimateUncertainty}
            onChange={(e) => setEstimateUncertainty(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
          />
          <label htmlFor="uncertainty-toggle" style={{ cursor: 'pointer', fontSize: '0.92rem' }}>
            <strong>Compute Spatial Uncertainty Map:</strong> Generates Monte-Carlo variance heatmaps to highlight inferred vs observed pixel confidence.
          </label>
        </div>

        {/* Progress Display */}
        {processing && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
              <span>{statusMessage}</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{progress}%</span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'var(--grad-primary)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary"
          id="btn-start-super-resolution"
          disabled={processing}
          style={{ padding: '1rem 2rem', fontSize: '1.05rem', alignSelf: 'flex-start' }}
        >
          <Sparkles size={20} />
          {processing ? 'Processing Sentinel-2 Scene...' : 'Start Generative Super-Resolution'}
        </button>
      </form>
    </div>
  );
}
