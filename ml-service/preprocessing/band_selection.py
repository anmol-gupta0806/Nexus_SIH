"""
Multi-Spectral Band Extraction & Index Computation for Sentinel-2 MSI
Extracts RGB, NIR (B08), Red Edge, and computes radiometric vegetation/water indices (NDVI, NDWI).
"""

import numpy as np
from typing import Dict, List, Tuple

BAND_INDICES_10M = {
    "B02": 0, # Blue (492nm)
    "B03": 1, # Green (560nm)
    "B04": 2, # Red (665nm)
    "B08": 3  # Near-Infrared (833nm)
}

def extract_true_color(multi_band: np.ndarray) -> np.ndarray:
    """
    Extracts True Color RGB from 4-band array [B02, B03, B04, B08].
    Returns shape (3, H, W) in order [Red, Green, Blue].
    """
    if multi_band.shape[0] >= 4:
        r = multi_band[2] # B04
        g = multi_band[1] # B03
        b = multi_band[0] # B02
        return np.stack([r, g, b], axis=0)
    elif multi_band.shape[0] == 3:
        return multi_band
    raise ValueError(f"Expected at least 3 bands, got {multi_band.shape[0]}")

def extract_color_infrared(multi_band: np.ndarray) -> np.ndarray:
    """
    Extracts False-Color Infrared (CIR) composite [B08 (NIR), B04 (Red), B03 (Green)].
    Used extensively in remote sensing for crop vigor and vegetation monitoring.
    """
    if multi_band.shape[0] >= 4:
        nir = multi_band[3] # B08
        r = multi_band[2]   # B04
        g = multi_band[1]   # B03
        return np.stack([nir, r, g], axis=0)
    raise ValueError("Color Infrared requires NIR band (B08) at index 3")

def calculate_ndvi(red: np.ndarray, nir: np.ndarray) -> np.ndarray:
    """
    Calculates Normalized Difference Vegetation Index:
    NDVI = (NIR - Red) / (NIR + Red)
    Values range from -1.0 to +1.0. High values (0.4 - 0.8) indicate dense vegetation.
    """
    denominator = nir + red
    # Avoid division by zero
    mask = denominator != 0
    ndvi = np.zeros_like(nir, dtype=np.float32)
    ndvi[mask] = (nir[mask] - red[mask]) / denominator[mask]
    return np.clip(ndvi, -1.0, 1.0)

def calculate_ndwi(green: np.ndarray, nir: np.ndarray) -> np.ndarray:
    """
    Calculates Normalized Difference Water Index (McFeeters):
    NDWI = (Green - NIR) / (Green + NIR)
    Positive values delineate water bodies and irrigation boundaries.
    """
    denominator = green + nir
    mask = denominator != 0
    ndwi = np.zeros_like(green, dtype=np.float32)
    ndwi[mask] = (green[mask] - nir[mask]) / denominator[mask]
    return np.clip(ndwi, -1.0, 1.0)