"""
Spatial Uncertainty Quantification for Remote Sensing Super-Resolution
Directly addresses the SIH requirement: "manage uncertainty because some reconstructed
details are inferred by the model and not directly observed."
Uses Monte Carlo stochastic sampling to produce pixel-level confidence and variance maps.
"""

import numpy as np
from typing import List, Tuple, Dict, Any

class SpatialUncertaintyEstimator:
    @staticmethod
    def compute_variance_map(predictions: List[np.ndarray]) -> Tuple[np.ndarray, Dict[str, float]]:
        """
        Computes pixel-wise variance across N stochastic model passes.
        
        Args:
            predictions: List of N numpy arrays, each shape (C, H, W)
        
        Returns:
            uncertainty_map: 2D array of shape (H, W) normalized to [0.0, 1.0]
            summary_stats: Dict containing mean, max, and high-uncertainty coverage percentage
        """
        if len(predictions) < 2:
            # Fallback when single pass: compute local gradient complexity as uncertainty proxy
            pred = predictions[0]
            if pred.ndim == 3:
                gray = np.mean(pred, axis=0)
            else:
                gray = pred
            gy, gx = np.gradient(gray)
            grad_mag = np.sqrt(gx**2 + gy**2)
            grad_norm = (grad_mag - grad_mag.min()) / (grad_mag.max() - grad_mag.min() + 1e-6)
            return grad_norm.astype(np.float32), {
                "mean_uncertainty": float(np.mean(grad_norm)),
                "max_uncertainty": float(np.max(grad_norm)),
                "high_uncertainty_coverage_pct": float(np.mean(grad_norm > 0.6) * 100.0)
            }

        # Stack along new dimension: (N, C, H, W)
        stacked = np.stack(predictions, axis=0)

        # Variance across N stochastic runs: (C, H, W)
        var_per_channel = np.var(stacked, axis=0)

        # Average variance across channels: (H, W)
        spatial_variance = np.mean(var_per_channel, axis=0)

        # Normalize variance map to [0, 1] range for visualization and thresholding
        v_min = spatial_variance.min()
        v_max = spatial_variance.max()
        norm_uncertainty = (spatial_variance - v_min) / (v_max - v_min + 1e-6)

        threshold = 0.55 # pixels with relative variance > 55% indicate hallucinated or inferred details
        high_uncertainty_pixels = np.sum(norm_uncertainty > threshold)
        total_pixels = norm_uncertainty.size
        coverage_pct = (high_uncertainty_pixels / total_pixels) * 100.0

        stats = {
            "mean_uncertainty": float(np.mean(norm_uncertainty)),
            "max_uncertainty": float(v_max),
            "high_uncertainty_coverage_pct": round(float(coverage_pct), 2),
            "total_pixels_evaluated": int(total_pixels)
        }

        return norm_uncertainty.astype(np.float32), stats

    @staticmethod
    def generate_heatmap_rgb(uncertainty_map: np.ndarray) -> np.ndarray:
        """
        Converts 2D float uncertainty array [0, 1] into a 3-channel RGB heatmap
        (Deep Blue = 0.0 High Confidence/Observed, Cyan = 0.3, Yellow = 0.7, Red = 1.0 Inferred/Uncertain).
        """
        h, w = uncertainty_map.shape
        heatmap = np.zeros((3, h, w), dtype=np.uint8)

        u = np.clip(uncertainty_map, 0.0, 1.0)

        # Blue channel (peaks at low uncertainty)
        heatmap[2] = np.clip((1.0 - u * 1.5) * 255.0, 0, 255).astype(np.uint8)
        # Green channel (peaks in middle transition)
        heatmap[1] = np.clip((1.0 - np.abs(u - 0.5) * 2.0) * 255.0, 0, 255).astype(np.uint8)
        # Red channel (peaks at high uncertainty / inferred sub-pixel features)
        heatmap[0] = np.clip((u * 1.8) * 255.0, 0, 255).astype(np.uint8)

        return heatmap