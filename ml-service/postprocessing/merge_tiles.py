"""
Seamless Tile Merging with 2D Smooth Blending
Reconstructs full-scene super-resolved satellite imagery from individual tile predictions
using cosine/Hann window blending to eliminate seam and edge artifacts.
"""

import numpy as np
from typing import List, Dict, Any

class TileMerger:
    @staticmethod
    def create_blending_weights(tile_size: int, channels: int = 1) -> np.ndarray:
        """
        Creates a 2D Hann (cosine) weight mask that tapers smoothly to 0 at the tile edges.
        When overlapping tiles are accumulated, boundary weights sum gracefully.
        """
        # 1D Hann window
        hann_1d = np.hanning(tile_size + 2)[1:-1]
        # 2D outer product
        hann_2d = np.outer(hann_1d, hann_1d).astype(np.float32)
        # Avoid zero division in non-overlapping regions
        hann_2d = np.maximum(hann_2d, 1e-4)

        if channels > 1:
            return np.expand_dims(hann_2d, axis=0) # (1, H, W)
        return hann_2d

    @classmethod
    def merge_super_resolved_tiles(
        cls,
        sr_tiles: List[np.ndarray],
        tiling_meta: Dict[str, Any],
        scale_factor: int = 4
    ) -> np.ndarray:
        """
        Merges super-resolved tiles into a unified full raster.
        
        Args:
            sr_tiles: List of super-resolved tiles of shape (C, sr_tile_size, sr_tile_size)
            tiling_meta: Metadata from RasterTiler.split_into_tiles
            scale_factor: Super-resolution upscale factor (default 4)
        
        Returns:
            Reconstructed full array of shape (C, H * scale_factor, W * scale_factor)
        """
        if not sr_tiles:
            raise ValueError("No tiles provided for merging.")

        channels = sr_tiles[0].shape[0] if sr_tiles[0].ndim == 3 else 1
        orig_c, orig_h, orig_w = tiling_meta["original_shape"]
        _, padded_h, padded_w = tiling_meta["padded_shape"]

        target_h = padded_h * scale_factor
        target_w = padded_w * scale_factor

        # Accumulator canvas and weight normalizer canvas
        canvas = np.zeros((channels, target_h, target_w), dtype=np.float32)
        weight_sum = np.zeros((1, target_h, target_w), dtype=np.float32)

        sr_tile_size = tiling_meta["tile_size"] * scale_factor
        weight_window = cls.create_blending_weights(sr_tile_size, channels=1)

        for tile, (y1, y2, x1, x2) in zip(sr_tiles, tiling_meta["coordinates"]):
            sy1 = y1 * scale_factor
            sy2 = y2 * scale_factor
            sx1 = x1 * scale_factor
            sx2 = x2 * scale_factor

            # Accumulate weighted prediction
            canvas[:, sy1:sy2, sx1:sx2] += tile * weight_window
            weight_sum[:, sy1:sy2, sx1:sx2] += weight_window

        # Normalize by accumulated weights
        weight_sum = np.maximum(weight_sum, 1e-5)
        reconstructed = canvas / weight_sum

        # Crop back to original dimensions scaled by factor
        final_h = orig_h * scale_factor
        final_w = orig_w * scale_factor
        return reconstructed[:, :final_h, :final_w]