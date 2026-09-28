import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  Settings2, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Sliders,
  Database,
  ArrowRight,
  Cpu
} from 'lucide-react';
import imageService from '../services/imageService';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [selectedSample, setSelectedSample] = useState('TCI.tif');
  const [useSample, setUseSample] = useState(false);
  const [modelType, setModelType] = useState('swin_ir');
  const [scaleFactor, setScaleFactor] = useState(4);
  const [estimateUncertainty, setEstimateUncertainty] = useState(true);
  const [selectedBands, setSelectedBands] = useState('rgb_nir');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    // Load available Copernicus samples from backend
    imageService.getSamples()
      .then(res => {
        if (res.samples && res.samples.length > 0) {
          setSamples(res.samples);
        }
      })
      .catch(() => {
        // Fallback default samples if server is cold
        setSamples([
          { filename: 'TCI.tif', label: 'Sentinel-2 True Color Image (TCI)', description: 'Natural Color RGB 10m Granule from Copernicus CDSE', sizeMb: '0.97' },
          { filename: 'B04.tif', label: 'Sentinel-2 Band 04 (Red)', description: '10m Surface Reflectance Red Band', sizeMb: '0.68' },
          { filename: 'B08.tif', label: 'Sentinel-2 Band 08 (NIR)', description: '10m Surface Reflectance Near-Infrared Band', sizeMb: '0.68' },
          { filename: 'B02.tif', label: 'Sentinel-2 Band 02 (Blue)', description: '10m Surface Reflectance Blue Band', sizeMb: '0.69' }
        ]);
      });
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUseSample(false);
      setErrorMessage('');
    }
  };

  const handleSelectSample = (sampleFilename) => {
    setSelectedSample(sampleFilename);
    setUseSample(true);
    setFile(null);
    setErrorMessage('');
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (!file && !useSample && !selectedSample) {
      setErrorMessage('Please upload a Sentinel-2 GeoTIFF or select one of the Copernicus test samples below.');
      return;
    }

    setProcessing(true);
    setErrorMessage('');
    setProgress(15);
    setStatusMessage('Uploading raster & extracting radiometric BOA metadata...');

    // Smooth status progression while server runs inference
    const pTimer1 = setTimeout(() => {
      setProgress(40);
      setStatusMessage('Decomposing 10m raster into 256x256 tiles with 32px overlap...');
    }, 800);

    const pTimer2 = setTimeout(() => {
      setProgress(68);
      setStatusMessage(`Executing ${modelType.toUpperCase()} neural enhancement & Monte-Carlo uncertainty estimation...`);
    }, 1800);

    const pTimer3 = setTimeout(() => {
      setProgress(88);
      setStatusMessage('Blending overlapping tiles & generating 2.5m GeoTIFF output with georeferencing...');
    }, 3200);

    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append('satellite_image', file);
        formData.append('model_type', modelType);
        formData.append('scale_factor', scaleFactor);
        formData.append('estimate_uncertainty', estimateUncertainty);
        formData.append('bands', selectedBands === 'rgb_nir' ? ['B04', 'B03', 'B02', 'B08'] : ['B04', 'B03', 'B02']);

        response = await imageService.uploadAndProcess(formData);
      } else {
        response = await imageService.processSample({
          sample_file: selectedSample || 'TCI.tif',
          model_type: modelType,
          scale_factor: scaleFactor,
          estimate_uncertainty: estimateUncertainty,
          bands: selectedBands === 'rgb_nir' ? ['B04', 'B03', 'B02', 'B08'] : ['B04', 'B03', 'B02']
        });
      }

      clearTimeout(pTimer1);
      clearTimeout(pTimer2);
      clearTimeout(pTimer3);

      setProgress(100);
      setStatusMessage('Super-Resolution synthesis complete! Preserving spatial coordinates...');

      setTimeout(() => {
        // Navigate to comparison viewer with the generated result
        const resultData = response.data || response;
        navigate('/comparison', { state: { result: resultData } });
      }, 600);

    } catch (err) {
      clearTimeout(pTimer1);
      clearTimeout(pTimer2);
      clearTimeout(pTimer3);
      setProcessing(false);
      setErrorMessage(err.message || 'Error occurred during super-resolution execution. Ensure FastAPI service is running.');
      setStatusMessage('');
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(6, 182, 212, 0.12)', border: '1px solid var(--border-glow)', padding: '0.35rem 0.85rem', borderRadius: '20px', color: 'var(--accent-cyan)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          <Sparkles size={14} /> SIH 2024 Remote Sensing Pipeline • 10m to &lt;4m GSD
        </div>
        <h1 style={{ fontSize: '2.1rem', marginBottom: '0.5rem' }}>Enhance Sentinel-2 Imagery</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Upload standard 10m Level-2A GeoTIFF rasters or choose an imported Copernicus Data Space scene to synthesize sub-4m high-fidelity spatial details with spectral consistency.
        </p>
      </div>

      {errorMessage && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid var(--accent-rose)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#fda4af'
        }}>
          <AlertCircle size={20} color="var(--accent-rose)" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleProcess} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Upload Zone */}
        <div 
          className="glass-panel"
          style={{
            border: file ? '2px solid var(--accent-cyan)' : '2px dashed var(--border-glow)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: file ? 'rgba(6, 182, 212, 0.05)' : 'rgba(13, 19, 34, 0.5)',
            transition: 'all 0.2s ease'
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
            backgroundColor: file ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.1)',
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
              <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem' }}>
                {file.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB • File selected & ready for model execution
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

        {/* Quick-Select Copernicus Samples */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={16} color="var(--accent-cyan)" />
              Or Test Instantly with Copernicus Data Space Ecosystem (CDSE) Scenes:
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real 10m Sentinel-2 Data</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem' }}>
            {samples.map((s) => {
              const isSelected = useSample && selectedSample === s.filename;
              return (
                <div
                  key={s.filename}
                  onClick={() => handleSelectSample(s.filename)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-surface)',
                    border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: isSelected ? 'var(--accent-cyan)' : '#ffffff' }}>
                      {s.filename}
                    </span>
                    {isSelected && <CheckCircle2 size={16} color="var(--accent-cyan)" />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {s.sizeMb} MB
                  </div>
                </div>
              );
            })}
          </div>
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
              <option value="swin_ir">SwinIR Transformer (Best Spectral Fidelity & PSNR)</option>
              <option value="srgan">Sentinel-2 SRGAN (Adversarial Edge Sharpening)</option>
              <option value="diffusion">GeoDiffusion-SR (Ultra Fine Textures)</option>
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
              <option value={4}>4x Scale (10m → 2.5m GSD - SIH Requirement)</option>
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
            <strong>Compute Spatial Uncertainty Quantification Map:</strong> Runs Monte-Carlo sampling to produce pixel-level epistemic uncertainty heatmaps.
          </label>
        </div>

        {/* Progress Display */}
        {processing && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={16} className="animate-spin" color="var(--accent-cyan)" />
                {statusMessage}
              </span>
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
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            type="submit"
            className="btn btn-primary"
            id="btn-start-super-resolution"
            disabled={processing}
            style={{ padding: '0.95rem 2rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <Sparkles size={20} />
            {processing ? 'Synthesizing 2.5m Super-Resolution...' : 'Start Generative Super-Resolution'}
          </button>

          {!file && !useSample && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              (Click a Copernicus sample or upload a file to begin)
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
