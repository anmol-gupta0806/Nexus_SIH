"""
Remote Sensing Radiometric Normalization for Sentinel-2 MSI L2A Imagery
Handles Bottom-of-Atmosphere (BOA) surface reflectance scaling and percentile contrast stretching.
"""

import numpy as np
from typing import Tuple, Optional

def normalize_sentinel2(
    arr: np.ndarray,
    method: str = "percentile",
    percentiles: Tuple[float, float] = (2.0, 98.0)
) -> Tuple[np.ndarray, dict]:
    """
    Normalizes Sentinel-2 multi-spectral data (typically 12-bit DN scaled to 0-10000 BOA reflectance)
    into standard [0.0, 1.0] float32 arrays.
    
    Args:
        arr: Input array of shape (C, H, W) or (H, W, C)
        method: "percentile" (robust remote sensing contrast) or "reflectance" (divide by 10000)
        percentiles: Low and high percentiles for contrast clipping
    
    Returns:
        normalized_array (float32 in [0, 1]), stats_dict for inversion
    """
    arr = arr.astype(np.float32)
    stats = {"method": method}

    if method == "reflectance":
        # ESA Sentinel-2 L2A BOA reflectance quantification value: 10000
        norm_arr = np.clip(arr / 10000.0, 0.0, 1.0)
    elif method == "percentile":
        # Per-band percentile stretch to handle extreme solar glint or deep shadow
        if arr.ndim == 3 and arr.shape[0] in [1, 3, 4, 8, 12]:
            # Shape is (C, H, W)
            norm_bands = []
            mins, maxs = [], []
            for b in range(arr.shape[0]):
                p_low = np.percentile(arr[b], percentiles[0])
                p_high = np.percentile(arr[b], percentiles[1])
                p_high = max(p_high, p_low + 1e-5)
                stretched = np.clip((arr[b] - p_low) / (p_high - p_low), 0.0, 1.0)
                norm_bands.append(stretched)
                mins.append(float(p_low))
                maxs.append(float(p_high))
            norm_arr = np.stack(norm_bands, axis=0)
            stats["mins"] = mins
            stats["maxs"] = maxs
        else:
            p_low = np.percentile(arr, percentiles[0])
            p_high = np.percentile(arr, percentiles[1])
            p_high = max(p_high, p_low + 1e-5)
            norm_arr = np.clip((arr - p_low) / (p_high - p_low), 0.0, 1.0)
            stats["min"] = float(p_low)
            stats["max"] = float(p_high)
    else:
        # Standard min-max
        p_min = arr.min()
        p_max = max(arr.max(), p_min + 1e-5)
        norm_arr = (arr - p_min) / (p_max - p_min)
        stats["min"] = float(p_min)
        stats["max"] = float(p_max)

    return norm_arr.astype(np.float32), stats

def denormalize_to_uint8(arr: np.ndarray) -> np.ndarray:
    """Converts normalized [0, 1] float array to 8-bit [0, 255] RGB visualization array."""
    clipped = np.clip(arr * 255.0, 0.0, 255.0)
    return clipped.astype(np.uint8)

def denormalize_to_sentinel2_dn(arr: np.ndarray, stats: Optional[dict] = None) -> np.ndarray:
    """Restores normalized float array to original 16-bit ESA Sentinel-2 DN scale [0, 10000]."""
    if stats and stats.get("method") == "reflectance":
        return np.clip(arr * 10000.0, 0, 10000).astype(np.uint16)
    return np.clip(arr * 10000.0, 0, 65535).astype(np.uint16)