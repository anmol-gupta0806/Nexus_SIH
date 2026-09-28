"""
Composite Multi-Spectral Loss Functions for Satellite Super-Resolution
Balances:
- L1 Content loss (pixel-level fidelity)
- Adversarial loss (sharp textures)
- Spectral Angle loss (protects multi-band color and NDVI ratios)
- Gradient/Edge loss (reconstructs narrow roads and field edges)
"""

import numpy as np

def compute_spectral_angle_loss(sr_tensor, hr_tensor):
    """
    Penalizes deviations in the multi-spectral angle vector.
    Enforces that ratio between B04 (Red) and B08 (NIR) remains physically consistent.
    """
    dot = np.sum(sr_tensor * hr_tensor, axis=0)
    norm_sr = np.linalg.norm(sr_tensor, axis=0)
    norm_hr = np.linalg.norm(hr_tensor, axis=0)
    cos = np.clip(dot / (norm_sr * norm_hr + 1e-6), -1.0, 1.0)
    return float(np.mean(np.arccos(cos)))

def compute_gradient_edge_loss(sr_tensor, hr_tensor):
    """Computes gradient difference between SR and HR along X and Y axes."""
    gy_sr, gx_sr = np.gradient(sr_tensor, axis=(-2, -1))
    gy_hr, gx_hr = np.gradient(hr_tensor, axis=(-2, -1))
    return float(np.mean(np.abs(gx_sr - gx_hr) + np.abs(gy_sr - gy_hr)))