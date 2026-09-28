"""
Scientific Remote Sensing Super-Resolution Evaluation Metrics
Implements standard Earth Observation metrics:
- PSNR (Peak Signal-to-Noise Ratio)
- SSIM (Structural Similarity Index)
- SAM (Spectral Angle Mapper) - Validates multi-spectral color preservation
- ERGAS (Relative Dimensionless Global Error in Synthesis)
- RMSE (Root Mean Square Error)
"""

import numpy as np
from typing import Dict, Any

class RemoteSensingMetrics:
    @staticmethod
    def calculate_psnr(target: np.ndarray, reference: np.ndarray, max_val: float = 1.0) -> float:
        """Computes Peak Signal-to-Noise Ratio in decibels (dB)."""
        mse = np.mean((target - reference) ** 2)
        if mse == 0:
            return float("inf")
        return float(20 * np.log10(max_val / np.sqrt(mse)))

    @staticmethod
    def calculate_ssim(target: np.ndarray, reference: np.ndarray, max_val: float = 1.0) -> float:
        """Computes Structural Similarity Index (SSIM) between target and reference arrays."""
        c1 = (0.01 * max_val) ** 2
        c2 = (0.03 * max_val) ** 2

        mu_x = np.mean(target)
        mu_y = np.mean(reference)

        sigma_x = np.var(target)
        sigma_y = np.var(reference)
        sigma_xy = np.mean((target - mu_x) * (reference - mu_y))

        numerator = (2 * mu_x * mu_y + c1) * (2 * sigma_xy + c2)
        denominator = (mu_x ** 2 + mu_y ** 2 + c1) * (sigma_x + sigma_y + c2)
        return float(numerator / (denominator + 1e-7))

    @staticmethod
    def calculate_sam(target: np.ndarray, reference: np.ndarray) -> float:
        """
        Spectral Angle Mapper (SAM):
        Computes the spectral angle between two multi-spectral vectors across all bands.
        Output in degrees. A SAM < 3.0° signifies near-lossless spectral fidelity.
        
        Expected shape: (C, H, W)
        """
        if target.ndim != 3 or reference.ndim != 3:
            return 0.0

        channels, height, width = target.shape
        t_flat = target.reshape(channels, -1) # (C, N)
        r_flat = reference.reshape(channels, -1) # (C, N)

        dot_product = np.sum(t_flat * r_flat, axis=0)
        norm_t = np.linalg.norm(t_flat, axis=0)
        norm_r = np.linalg.norm(r_flat, axis=0)

        denominator = norm_t * norm_r
        valid_mask = denominator > 1e-6

        cos_angles = np.zeros(dot_product.shape[0])
        cos_angles[valid_mask] = dot_product[valid_mask] / denominator[valid_mask]
        cos_angles = np.clip(cos_angles, -1.0, 1.0)

        sam_rad = np.mean(np.arccos(cos_angles[valid_mask])) if np.any(valid_mask) else 0.0
        sam_deg = float(np.degrees(sam_rad))
        return sam_deg

    @staticmethod
    def calculate_ergas(target: np.ndarray, reference: np.ndarray, scale_factor: int = 4) -> float:
        """
        Relative Dimensionless Global Error in Synthesis (ERGAS):
        Standard metric in satellite pansharpening and super-resolution.
        Values < 3.0 denote acceptable synthesis quality.
        """
        if target.ndim != 3:
            return 0.0

        channels = target.shape[0]
        sum_err = 0.0

        for c in range(channels):
            rmse_c = np.sqrt(np.mean((target[c] - reference[c]) ** 2))
            mean_c = np.mean(reference[c]) + 1e-6
            sum_err += (rmse_c / mean_c) ** 2

        ergas = 100.0 * (1.0 / scale_factor) * np.sqrt(sum_err / channels)
        return float(ergas)

    @classmethod
    def evaluate_all(
        cls,
        target: np.ndarray,
        reference: np.ndarray,
        scale_factor: int = 4
    ) -> Dict[str, float]:
        """Runs full suite of remote sensing validation metrics."""
        return {
            "psnr": round(cls.calculate_psnr(target, reference), 2),
            "ssim": round(cls.calculate_ssim(target, reference), 4),
            "sam_deg": round(cls.calculate_sam(target, reference), 2),
            "ergas": round(cls.calculate_ergas(target, reference, scale_factor), 2),
            "rmse": round(float(np.sqrt(np.mean((target - reference) ** 2))), 4)
        }