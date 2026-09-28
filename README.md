# 🛰️ Nexus SR | Sentinel-2 Satellite Super-Resolution Framework

An end-to-end Earth Observation Generative Super-Resolution framework designed to transform **10m Sentinel-2 multi-spectral imagery** into sharp **<4.0m spatial resolution products** (2.5m GSD target) with certified **spectral consistency** and **pixel-level uncertainty quantification**.

---

## 🏛️ System Architecture

- **Client (`client/`)**: Modern React (Vite) interface featuring satellite imagery upload, split-screen resolution comparator, spectral band analysis, and uncertainty map visualization.
- **Server (`server/`)**: Express.js REST API server, WebSocket bridge (Socket.io) for real-time progress, file/raster storage handlers, and job queue orchestration.
- **ML Engine (`ml-service/`)**: FastAPI microservice serving SRGAN, Diffusion, and SwinIR Transformer pipelines for multi-spectral satellite inference with Monte Carlo variance uncertainty quantification.
- **Data Pipeline (`data/`)**: Structured directories for raw Sentinel-2 L2A tiles, high-resolution ground truth pairs, and super-resolved GeoTIFF outputs.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24+)
- **Python**: 3.10+ (tested on 3.13+)
- **MongoDB** (optional in dev mode, server falls back gracefully)

### 2. Install Dependencies

```bash
# Install root orchestrator
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Set up Python ML virtual environment
cd ../ml-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Running Development Servers

```bash
# Terminal 1: Backend Express API (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend React UI (Port 5173)
cd client
npm run dev

# Terminal 3: Python ML Service (Port 8000)
cd ml-service
venv\Scripts\activate
uvicorn api.app:app --host 127.0.0.1 --port 8000 --reload
```

---

## 🔬 Scientific & Evaluation Metrics

- **PSNR**: Spatial signal reconstruction fidelity (> 30 dB target).
- **SSIM**: Structural similarity preservation (> 0.85 target).
- **SAM (Spectral Angle Mapper)**: Validates physical spectral angle across channels (< 3.0° target).
- **ERGAS**: Dimensionless global error in synthesis.
- **Uncertainty Mapping**: Monte-Carlo dropout / stochastic sampling variance highlighting model-inferred details vs directly observed reflectance.