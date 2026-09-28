"""
Sliding Window Tiling for Large Sentinel-2 Satellite Rasters
Splits multi-spectral rasters into overlapping patches for GPU memory management
and records coordinate grids for seam-blended reconstruction.
"""

import numpy as np
from typing import List, Tuple, Dict, Any

class RasterTiler:
    def __init__(self, tile_size: int = 256, overlap: int = 32):
        self.tile_size = tile_size
        self.overlap = overlap
        self.stride = tile_size - overlap

    def split_into_tiles(self, image: np.ndarray) -> Tuple[List[np.ndarray], Dict[str, Any]]:
        """
        Splits an image of shape (C, H, W) or (H, W) into overlapping tiles.
        Returns:
            tiles: List of ndarray patches of shape (C, tile_size, tile_size)
            meta: Dict containing original shape, grid coordinates, and padding info
        """
        if image.ndim == 2:
            image = np.expand_dims(image, axis=0) # (1, H, W)

        channels, height, width = image.shape

        # Calculate padding needed to cover entire scene with integer strides
        pad_h = (self.stride - (height - self.tile_size) % self.stride) % self.stride
        pad_w = (self.stride - (width - self.tile_size) % self.stride) % self.stride

        padded = np.pad(
            image,
            ((0, 0), (0, pad_h), (0, pad_w)),
            mode="reflect"
        )
        _, padded_h, padded_w = padded.shape

        tiles = []
        coordinates = [] # list of (y_start, y_end, x_start, x_end)

        for y in range(0, padded_h - self.tile_size + 1, self.stride):
            for x in range(0, padded_w - self.tile_size + 1, self.stride):
                tile = padded[:, y:y + self.tile_size, x:x + self.tile_size]
                tiles.append(tile)
                coordinates.append((y, y + self.tile_size, x, x + self.tile_size))

        meta = {
            "original_shape": (channels, height, width),
            "padded_shape": (channels, padded_h, padded_w),
            "tile_size": self.tile_size,
            "overlap": self.overlap,
            "stride": self.stride,
            "num_tiles": len(tiles),
            "coordinates": coordinates
        }

        return tiles, meta