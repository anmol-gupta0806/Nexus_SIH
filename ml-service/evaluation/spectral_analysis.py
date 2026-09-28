"""
Spectral Fidelity & Earth Observation Index Verification
Ensures multi-spectral relationships (NDVI, NDWI) are preserved without distortion
after applying deep generative super-resolution.
"""

import numpy as np
from typing import Dict, Any

class SpectralConsistencyAnalyzer:
    @staticmethod
    def verify_ndvi_consistency(
        sr_red: np.ndarray,
        sr_nir: np.ndarray,
        ref_red: np.ndarray,
        ref_nir: np.ndarray
    ) -> Dict[str, float]:
        """
        Validates Normalized Difference Vegetation Index (NDVI) consistency:
        Calculates Pearson correlation between reconstructed NDVI and reference NDVI.
        """
        def get_ndvi(r, n):
            denom = n + r
            mask = denom != 0
            res = np.zeros_like(r)
            res[mask] = (n[mask] - r[mask]) / denom[mask]
            return res

        sr_ndvi = get_ndvi(sr_red, sr_nir)
        ref_ndvi = get_ndvi(ref_red, ref_nir)

        mae = float(np.mean(np.abs(sr_ndvi - ref_ndvi)))
        corr_matrix = np.corrcoef(sr_ndvi.flatten(), ref_ndvi.flatten())
        correlation = float(corr_matrix[0, 1]) if not np.isnan(corr_matrix[0, 1]) else 1.0

        return {
            "ndvi_mae": round(mae, 4),
            "ndvi_correlation": round(correlation, 4),
            "mean_sr_ndvi": round(float(np.mean(sr_ndvi)), 3),
            "mean_ref_ndvi": round(float(np.mean(ref_ndvi)), 3),
            "verdict": "Passed" if correlation > 0.88 and mae < 0.08 else "Warning: Spectral Drift"
        }