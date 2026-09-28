# 🛰️ Copernicus Data Space Ecosystem (CDSE) & Sentinel-2 Dataset Guide

Portal: [https://browser.dataspace.copernicus.eu](https://browser.dataspace.copernicus.eu)

---

## 1. Overview
The European Space Agency (ESA) provides Copernicus Sentinel-2 multi-spectral Earth observation data through the **Copernicus Data Space Ecosystem (CDSE)**. This portal supersedes the legacy Copernicus Open Access Hub (SciHub).

For this super-resolution challenge, the pipeline processes **Sentinel-2 Level-2A (Bottom-Of-Atmosphere / Surface Reflectance)** products.

---

## 2. Sentinel-2 Band Configuration

| Band | Description | Central Wavelength (nm) | Native Spatial Resolution (m) | Super-Resolved Target (<4m) | Primary Application |
|------|-------------|-------------------------|-------------------------------|-----------------------------|---------------------|
| **B02** | Blue | 492.4 nm | **10m** | **2.5m** | Soil/vegetation differentiation, water mapping |
| **B03** | Green | 559.8 nm | **10m** | **2.5m** | Peak vegetation vigor, NDWI calculation |
| **B04** | Red | 664.6 nm | **10m** | **2.5m** | Chlorophyll absorption, road networks |
| **B08** | Near-Infrared (NIR) | 832.8 nm | **10m** | **2.5m** | Biomass content, NDVI vegetation index |
| **B05** | Red Edge 1 | 704.1 nm | 20m | 5.0m | Crop stress & nitrogen tracking |
| **B06** | Red Edge 2 | 740.5 nm | 20m | 5.0m | Leaf area index (LAI) |
| **B11** | SWIR 1 | 1613.7 nm | 20m | 5.0m | Soil & canopy moisture content |

---

## 3. How to Obtain Data from Copernicus Browser

1. Navigate to [https://browser.dataspace.copernicus.eu](https://browser.dataspace.copernicus.eu).
2. Register for a free Copernicus Data Space account.
3. In the search panel:
   - Select **Sentinel-2** as the data source.
   - Choose **L2A (Bottom-of-Atmosphere Reflectance)**.
   - Set **Max Cloud Coverage** to $\le 10\%$.
   - Specify your area of interest (AOI) bounding box.
4. Download the `.SAFE` product granule or directly fetch the 10m GeoTIFF bands (`B02_10m.jp2`, `B03_10m.jp2`, `B04_10m.jp2`, `B08_10m.jp2`).
5. Place downloaded granules in `data/raw/sentinel2/`.

---

## 4. Automated Querying via CDSE API

You can use the built-in script in `scripts/download_sentinel_data.py`:

```bash
# Query cloud-free Sentinel-2 scenes for your region of interest
python scripts/download_sentinel_data.py --bbox 76.85 28.40 77.35 28.75 --max-cloud 5.0
```

---

## 5. Preprocessing & Normalization Protocol
1. **Radiometric Scaling**: Sentinel-2 L2A pixel values are stored as 16-bit integers with a quantification factor of 10,000. Values are converted to BOA surface reflectance in $[0.0, 1.0]$.
2. **Contrast Percentile Stretching**: 2% to 98% percentile clipping is applied to eliminate atmospheric haze without clipping urban structures or reflective clouds.
3. **Overlapping Tiling**: Rasters are decomposed into $256 \times 256$ patches with $32\text{px}$ strides to prevent GPU out-of-memory errors on large scenes.